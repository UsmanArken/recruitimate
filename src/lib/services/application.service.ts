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
import {
  computeTalentAndDecision,
  refreshApplicationIntelligence,
  talentForStorage,
} from "@/lib/services/candidate-intelligence.service";

export async function listApplications(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await applicationsWhereClause(ctx);
  return db.jobApplication.findMany({
    where,
    include: applicationListInclude,
    orderBy: { updatedAt: "desc" },
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
  if (!candidate.resumeText) {
    throw badRequest("Candidate has no resume on file", "NO_RESUME");
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
    resumeText: candidate.resumeText,
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

  if (!application.candidate.resumeText) {
    throw badRequest("No resume text", "NO_RESUME");
  }

  return refreshApplicationIntelligence({
    applicationId,
    candidateName: application.candidate.name,
    resumeText: application.candidate.resumeText,
    job: {
      id: application.jobId,
      title: application.job.title,
      requirements: application.job.requirements,
    },
    interviews: application.interviews,
  });
}
