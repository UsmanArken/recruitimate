import { db } from "@/lib/db";
import { candidateWithTalentInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertCandidateAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import { toTalentIntelligenceResult } from "@/lib/intelligence/mappers";
import type { CreateInterviewInput } from "@/lib/validators/interview";
import { upsertDecision } from "@/lib/services/decision.service";

export async function createInterviewAndAnalyze(
  ctx: AuthContext,
  candidateId: string,
  input: CreateInterviewInput
) {
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  const { jobId } = await assertCandidateAccess(ctx, candidateId);

  if (jobId) {
    await assertPermission(ctx, {
      resource: "interviews",
      action: "create",
      jobId,
    });
  }

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    include: candidateWithTalentInclude,
  });

  if (!candidate) throw notFound("Candidate");

  const analysis = await analyzeInterview(input.transcript, candidate.resumeText);

  const interview = await db.interview.create({
    data: {
      candidateId,
      title: input.title,
      status: "ANALYZED",
      transcript: input.transcript,
      analysis: {
        create: {
          hesitationScore: analysis.hesitationScore,
          confidenceScore: analysis.confidenceScore,
          clarityScore: analysis.clarityScore,
          consistencyScore: analysis.consistencyScore,
          engagementScore: analysis.engagementScore,
          cognitiveSignals: analysis.cognitiveSignals,
          behavioralMetrics: analysis.behavioralMetrics,
          riskFlags: analysis.riskFlags,
          explanation: analysis.explanation,
          rawAnalysis: analysis,
        },
      },
    },
    include: { analysis: true },
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: { stage: "INTERVIEWED" },
  });

  const talent = toTalentIntelligenceResult(candidate.talentProfile);
  const decision = await generateDecision(talent, analysis, candidate.name);
  await upsertDecision(candidateId, decision);

  return { interview, decision };
}
