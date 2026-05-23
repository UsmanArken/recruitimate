import { chatJson } from "../ai";
import {
  buildDeferredDecision,
  getIntelligencePhase,
} from "../candidate-context";
import type {
  DecisionIntelligenceResult,
  InterviewIntelligenceResult,
  TalentIntelligenceResult,
} from "../types";

const SYSTEM_PROMPT = `You are Recruitimate's Decision Intelligence Engine.
Synthesize talent + interview signals into a hire recommendation. Be explainable. Show uncertainty.
Never use black-box language. Output valid JSON:
{
  "hireConfidence": number (0-1),
  "recommendation": "strong_yes"|"yes"|"maybe"|"no"|"strong_no",
  "riskFactors": [{ "label", "value", "evidence", "confidence" }],
  "explanation": string,
  "signalBreakdown": { "talentWeight": number, "interviewWeight": number, "talentScore": number, "interviewScore": number }
}`;

function recommendationFromScore(score: number): DecisionIntelligenceResult["recommendation"] {
  if (score >= 0.8) return "strong_yes";
  if (score >= 0.65) return "yes";
  if (score >= 0.45) return "maybe";
  if (score >= 0.3) return "no";
  return "strong_no";
}

function heuristicDecision(
  talent: TalentIntelligenceResult | null,
  interview: InterviewIntelligenceResult | null
): DecisionIntelligenceResult {
  const talentScore = talent?.roleFitScore ?? 0.5;
  const interviewScore = interview
    ? (interview.confidenceScore +
        interview.clarityScore +
        interview.consistencyScore +
        interview.engagementScore) /
      4
    : 0.5;

  const talentWeight = interview ? 0.4 : 1;
  const interviewWeight = interview ? 0.6 : 0;
  const hireConfidence =
    talentScore * talentWeight + interviewScore * interviewWeight;

  const riskFactors = [
    ...(talent?.gaps ?? []).map((g) => ({
      label: "Talent gap",
      value: g,
      evidence: "From talent intelligence layer",
      confidence: "medium" as const,
    })),
    ...(interview?.riskFlags ?? []),
  ];

  return {
    hireConfidence,
    recommendation: recommendationFromScore(hireConfidence),
    riskFactors,
    explanation: interview
      ? `Combined talent fit (${Math.round(talentScore * 100)}%) and interview signals (${Math.round(interviewScore * 100)}%). Human review recommended before final hire.`
      : `Talent-only decision — no interview analyzed yet (${Math.round(talentScore * 100)}% fit).`,
    signalBreakdown: {
      talentWeight,
      interviewWeight,
      talentScore,
      interviewScore,
    },
  };
}

export async function generateDecision(
  talent: TalentIntelligenceResult | null,
  interview: InterviewIntelligenceResult | null,
  candidateName: string,
  context: { jobId: string | null; jobTitle?: string | null }
): Promise<DecisionIntelligenceResult> {
  const phase = getIntelligencePhase(
    context.jobId,
    Boolean(interview)
  );

  if (phase === "needs_role") {
    return buildDeferredDecision("needs_role");
  }
  if (phase === "talent_screening") {
    return buildDeferredDecision("talent_screening", context.jobTitle);
  }

  const fallback = heuristicDecision(talent, interview);

  const userPrompt = `Candidate: ${candidateName}
Role: ${context.jobTitle ?? "Assigned requisition"}
Talent signals: ${JSON.stringify(talent)}
Interview signals: ${JSON.stringify(interview)}`;

  return chatJson<DecisionIntelligenceResult>(SYSTEM_PROMPT, userPrompt, fallback);
}
