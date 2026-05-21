import { db } from "@/lib/db";
import { candidateWithTalentInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import { toTalentIntelligenceResult } from "@/lib/intelligence/mappers";
import type { CreateInterviewInput } from "@/lib/validators/interview";
import { upsertDecision } from "@/lib/services/decision.service";

export async function createInterviewAndAnalyze(
  candidateId: string,
  input: CreateInterviewInput
) {
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
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
