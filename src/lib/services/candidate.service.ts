import { db } from "@/lib/db";
import {
  candidateDetailInclude,
  candidateListInclude,
  candidateWithJobAndInterviewsInclude,
} from "@/lib/db/includes";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import {
  assertCandidateAccess,
  candidatesWhereClause,
} from "@/lib/auth/scope.service";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import { toInterviewIntelligenceResult } from "@/lib/intelligence/mappers";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateCandidateInput } from "@/lib/validators/candidate";
import { getJobById } from "@/lib/services/job.service";
import { upsertTalentProfile } from "@/lib/services/talent-profile.service";
import { upsertDecision } from "@/lib/services/decision.service";

export async function listCandidates(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await candidatesWhereClause(ctx);
  return db.candidate.findMany({
    where,
    include: candidateListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCandidateById(ctx: AuthContext, id: string) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  await assertCandidateAccess(ctx, id);

  const candidate = await db.candidate.findFirst({
    where: { id, organizationId: ctx.organizationId },
    include: candidateDetailInclude,
  });
  if (!candidate) throw notFound("Candidate");
  return candidate;
}

export async function createCandidate(ctx: AuthContext, input: CreateCandidateInput) {
  await assertPermission(ctx, { resource: "candidates", action: "create" });

  const job = input.jobId ? await getJobById(ctx, input.jobId) : null;

  const talent = await analyzeTalent(
    input.resumeText,
    job?.title,
    job?.requirements
  );
  const decision = await generateDecision(talent, null, input.name);

  return db.candidate.create({
    data: {
      name: input.name,
      email: input.email || null,
      organizationId: ctx.organizationId,
      jobId: job?.id ?? null,
      resumeText: input.resumeText,
      linkedInUrl: input.linkedInUrl || null,
      githubUrl: input.githubUrl || null,
      stage: "TALENT_REVIEW",
      talentProfile: {
        create: {
          skills: talent.skills,
          experienceYears: talent.experienceYears,
          roleFitScore: talent.roleFitScore,
          strengths: talent.strengths,
          gaps: talent.gaps,
          hiddenSignals: talent.hiddenSignals,
          explanation: talent.explanation,
          rawAnalysis: talent,
        },
      },
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
    include: candidateListInclude,
  });
}

export async function rerunTalentAnalysis(ctx: AuthContext, candidateId: string) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const { jobId } = await assertCandidateAccess(ctx, candidateId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, organizationId: ctx.organizationId },
    include: candidateWithJobAndInterviewsInclude,
  });

  if (!candidate) throw notFound("Candidate");
  if (!candidate.resumeText) throw badRequest("No resume text", "NO_RESUME");

  const talent = await analyzeTalent(
    candidate.resumeText,
    candidate.job?.title,
    candidate.job?.requirements
  );

  await upsertTalentProfile(candidateId, talent);

  const latestWithAnalysis = candidate.interviews.find((i) => i.analysis);
  const interviewResult = latestWithAnalysis?.analysis
    ? toInterviewIntelligenceResult(latestWithAnalysis.analysis)
    : null;

  const decision = await generateDecision(talent, interviewResult, candidate.name);
  await upsertDecision(candidateId, decision);

  return { talent, decision, jobId };
}
