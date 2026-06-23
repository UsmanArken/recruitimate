import { db } from "@/lib/db";
import { applicationDetailInclude, candidatePersonInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import {
  assertCandidateAccess,
  candidatesWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateCandidateInput } from "@/lib/validators/candidate";
import type { UpdateCandidateMarkingInput } from "@/lib/validators/candidate-profile";
import { getJobById } from "@/lib/services/job.service";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import {
  computeTalentAndDecision,
  talentForStorage,
} from "@/lib/services/candidate-intelligence.service";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import type { TalentIntelligenceResult } from "@/lib/intelligence/types";

function genericScreeningForStorage(talent: TalentIntelligenceResult) {
  return {
    skills: talent.skills,
    experienceYears: talent.experienceYears,
    strengths: talent.strengths,
    gaps: talent.gaps,
    hiddenSignals: talent.hiddenSignals,
    explanation: talent.explanation,
    screenedAt: new Date().toISOString(),
  };
}
export async function listCandidates(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await candidatesWhereClause(ctx);
  return db.candidate.findMany({
    where,
    include: candidatePersonInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCandidateById(ctx: AuthContext, id: string) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  await assertCandidateAccess(ctx, id);

  const candidate = await db.candidate.findFirst({
    where: { id, ...organizationFilter(ctx) },
    include: candidatePersonInclude,
  });
  if (!candidate) throw notFound("Candidate");
  return candidate;
}

export async function createCandidate(ctx: AuthContext, input: CreateCandidateInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "create" });

  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const jobId = input.jobId?.trim() || undefined;

  const intelligenceText = buildCandidateIntelligenceText({
    resumeText: input.resumeText,
    linkedInText: input.linkedInText,
    githubUrl: input.githubUrl,
  });

  if (!jobId) {
    const genericTalent = await analyzeTalent(intelligenceText);

    const candidate = await db.candidate.create({
      data: {
        name: input.name,
        email: input.email || null,
        organizationId,
        resumeText: input.resumeText,
        sourceFileName: input.sourceFileName || null,
        linkedInText: input.linkedInText?.trim() || null,
        linkedInUrl: input.linkedInUrl || null,
        githubUrl: input.githubUrl || null,
        portfolioUrl: input.portfolioUrl || null,
        genericScreening: genericScreeningForStorage(genericTalent),
      },
      include: {
        applications: { include: applicationDetailInclude, take: 1 },
      },
    });

    return candidate;
  }

  const job = await getJobById(ctx, jobId);

  const { talent, decision } = await computeTalentAndDecision({
    candidateName: input.name,
    resumeText: intelligenceText,
    job: {
      id: job.id,
      title: job.title,
      requirements: job.requirements,
    },
    interviews: [],
  });

  const candidate = await db.candidate.create({
    data: {
      name: input.name,
      email: input.email || null,
      organizationId,
      resumeText: input.resumeText,
      sourceFileName: input.sourceFileName || null,
      linkedInText: input.linkedInText?.trim() || null,
      linkedInUrl: input.linkedInUrl || null,
      githubUrl: input.githubUrl || null,
      portfolioUrl: input.portfolioUrl || null,
      applications: {
        create: {
          organizationId,
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
      },
    },
    include: {
      applications: { include: applicationDetailInclude, take: 1 },
    },
  });

  return candidate;
}

export async function updateCandidateMarking(
  ctx: AuthContext,
  id: string,
  input: UpdateCandidateMarkingInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertCandidateAccess(ctx, id);

  return db.candidate.update({
    where: { id },
    data: { marking: input.marking },
  });
}

export async function deleteCandidate(ctx: AuthContext, id: string) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "delete" });
  await assertCandidateAccess(ctx, id);
  await db.candidate.delete({ where: { id } });
}
