import { db } from "@/lib/db";
import {
  applicationDetailInclude,
  applicationListInclude,
} from "@/lib/db/includes";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import {
  assertApplicationAccess,
  applicationsWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { getJobById } from "@/lib/services/job.service";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import {
  computeTalentAndDecision,
  refreshApplicationIntelligence,
  talentForStorage,
} from "@/lib/services/candidate-intelligence.service";

import type { PipelineStage, CandidateMarking, Prisma } from "@prisma/client";

export type ApplicationListFilters = {
  jobId?: string;
  stage?: PipelineStage;
  marking?: CandidateMarking;
  search?: string;
};

export async function listApplications(ctx: AuthContext, filters: ApplicationListFilters = {}) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await applicationsWhereClause(ctx);
  const search = filters.search?.trim().toLowerCase();

  const candidateWhere: Prisma.CandidateWhereInput = {};

  if (filters.marking) {
    candidateWhere.marking = filters.marking;
  }
  if (search) {
    candidateWhere.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return db.jobApplication.findMany({
    where: {
      ...where,
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
      ...(filters.stage ? { stage: filters.stage } : {}),
      ...(Object.keys(candidateWhere).length > 0 ? { candidate: candidateWhere } : {}),
    },
    include: applicationListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function listApplicationsForJob(ctx: AuthContext, jobId: string) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  await getJobById(ctx, jobId);
  const where = await applicationsWhereClause(ctx);
  const applications = await db.jobApplication.findMany({
    where: { ...where, jobId },
    include: applicationListInclude,
  });
  return applications.sort((a, b) => {
    const aScore = a.talentProfile?.roleFitScore ?? -1;
    const bScore = b.talentProfile?.roleFitScore ?? -1;
    return bScore - aScore;
  });
}

export async function getApplicationById(ctx: AuthContext, applicationId: string) {
  await assertApplicationAccess(ctx, applicationId);
  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: applicationDetailInclude,
  });
  if (!application) throw notFound("Application");
  return application;
}

export async function createApplicationForCandidate(
  ctx: AuthContext,
  candidateId: string,
  jobId: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
  });
  if (!candidate) throw notFound("Candidate");
  const intelligenceText = buildCandidateIntelligenceText(candidate);
  if (intelligenceText.length < 20) {
    throw badRequest("Candidate has no resume or LinkedIn profile on file", "NO_PROFILE_TEXT");
  }

  const job = await getJobById(ctx, jobId);

  const existing = await db.jobApplication.findUnique({
    where: { candidateId_jobId: { candidateId, jobId } },
  });
  if (existing) {
    throw badRequest(
      "This person is already in review for that open position",
      "ALREADY_APPLIED"
    );
  }

  const { talent, decision } = await computeTalentAndDecision({
    candidateName: candidate.name,
    resumeText: intelligenceText,
    job: { id: job.id, title: job.title, requirements: job.requirements },
    interviews: [],
  });

  return db.jobApplication.create({
    data: {
      organizationId,
      candidateId: candidate.id,
      jobId: job.id,
      stage: "TALENT_REVIEW",
      talentProfile: { create: talentForStorage(talent) },
      decision: {
        create: {
          hireConfidence: decision.hireConfidence,
          recommendation: decision.recommendation,
          riskFactors: decision.riskFactors,
          explanation: decision.explanation,
          signalBreakdown: decision.signalBreakdown,
        },
      },
    },
    include: applicationDetailInclude,
  });
}

export async function rerunApplicationIntelligence(
  ctx: AuthContext,
  applicationId: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const application = await getApplicationById(ctx, applicationId);

  const intelligenceText = buildCandidateIntelligenceText(application.candidate);
  if (intelligenceText.length < 20) {
    throw badRequest("No resume or LinkedIn profile text", "NO_PROFILE_TEXT");
  }

  return refreshApplicationIntelligence({
    applicationId,
    candidateName: application.candidate.name,
    resumeText: intelligenceText,
    job: {
      id: application.jobId,
      title: application.job.title,
      requirements: application.job.requirements,
    },
    interviews: application.interviews,
  });
}
