import type { Prisma } from "@prisma/client";
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
import { getJobById } from "@/lib/services/job.service";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { buildDiscoveryDocument } from "@/lib/intelligence/talent/discovery-engine";
import {
  computeTalentAndDecision,
  talentForStorage,
} from "@/lib/services/candidate-intelligence.service";
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

  const job = await getJobById(ctx, input.jobId);
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const intelligenceText = buildCandidateIntelligenceText({
    resumeText: input.resumeText,
    linkedInText: input.linkedInText,
    githubUrl: input.githubUrl,
  });
  const discoveryDoc = buildDiscoveryDocument({
    resumeText: input.resumeText,
    linkedInText: input.linkedInText,
    githubUrl: input.githubUrl,
    name: input.name,
  });

  const { talent, decision } = await computeTalentAndDecision({
    candidateName: input.name,
    resumeText: intelligenceText,
    job: {
      id: job.id,
      title: job.title,
      requirements: job.requirements,
    },
    interviews: [],
    organizationId,
  });

  const candidate = await db.candidate.create({
    data: {
      name: input.name,
      email: input.email || null,
      organizationId,
      resumeText: input.resumeText,
      resumeFilePath: input.resumeFilePath ?? null,
      linkedInText: input.linkedInText?.trim() || null,
      linkedInUrl: input.linkedInUrl || null,
      githubUrl: input.githubUrl || null,
      source: "MANUAL",
      searchDocument: discoveryDoc.searchDocument || null,
      searchSkills: discoveryDoc.searchSkills as Prisma.InputJsonValue,
      discoveryIndexedAt: new Date(),
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
