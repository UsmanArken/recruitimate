import { chatJson } from "../ai";
import {
  buildDeferredDecision,
  getIntelligencePhase,
} from "../candidate-context";
import { blendDecisionScores } from "./weights";
import type {
  AssessmentSignal,
  DecisionIntelligenceResult,
  InterviewIntelligenceResult,
  TalentIntelligenceResult,
} from "../types";

const SYSTEM_PROMPT = `You are Recruitimate's Decision Intelligence Engine.
Synthesize talent + interview + assessment signals into a hire recommendation. Be explainable. Show uncertainty.
Never use black-box language. Output valid JSON:
{
  "hireConfidence": number (0-1),
  "recommendation": "strong_yes"|"yes"|"maybe"|"no"|"strong_no",
  "riskFactors": [{ "label", "value", "evidence", "confidence" }],
  "explanation": string,
  "signalBreakdown": {
    "talentWeight": number,
    "interviewWeight": number,
    "assessmentWeight": number,
    "talentScore": number,
    "interviewScore": number,
    "assessmentScore": number
  }
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
  interview: InterviewIntelligenceResult | null,
  assessment: AssessmentSignal | null
): DecisionIntelligenceResult {
  const talentScore = talent?.roleFitScore ?? 0.5;
  const interviewScore = interview
    ? (interview.confidenceScore +
        interview.clarityScore +
        interview.consistencyScore +
        interview.engagementScore) /
      4
    : 0.5;
  const assessmentScore = assessment?.overallScore ?? 0.5;

  const hasInterview = Boolean(interview);
  const hasAssessment = Boolean(assessment);
  const { hireConfidence, weights } = blendDecisionScores({
    talentScore,
    interviewScore,
    assessmentScore,
    hasInterview,
    hasAssessment,
  });

  const riskFactors = [
    ...(talent?.gaps ?? []).map((g) => ({
      label: "Talent gap",
      value: g,
      evidence: "From talent intelligence layer",
      confidence: "medium" as const,
    })),
    ...(interview?.riskFlags ?? []),
    ...(assessment && assessment.overallScore < 0.5
      ? [
          {
            label: "Assessment concern",
            value: "Below-average task performance",
            evidence: `Assessment score ${Math.round(assessment.overallScore * 100)}%`,
            confidence: "medium" as const,
          },
        ]
      : []),
  ];

  const parts: string[] = [];
  parts.push(`Talent fit ${Math.round(talentScore * 100)}%`);
  if (hasInterview) parts.push(`interview ${Math.round(interviewScore * 100)}%`);
  if (hasAssessment) parts.push(`assessment ${Math.round(assessmentScore * 100)}%`);

  return {
    hireConfidence,
    recommendation: recommendationFromScore(hireConfidence),
    riskFactors,
    explanation: `${parts.join(" · ")}. Human review recommended before final hire.`,
    signalBreakdown: {
      talentWeight: weights.talent,
      interviewWeight: weights.interview,
      assessmentWeight: weights.assessment,
      talentScore,
      interviewScore: hasInterview ? interviewScore : 0,
      assessmentScore: hasAssessment ? assessmentScore : 0,
    },
  };
}

export async function generateDecision(
  talent: TalentIntelligenceResult | null,
  interview: InterviewIntelligenceResult | null,
  candidateName: string,
  context: { jobId: string | null; jobTitle?: string | null },
  assessment?: AssessmentSignal | null
): Promise<DecisionIntelligenceResult> {
  const phase = getIntelligencePhase(context.jobId, Boolean(interview));

  if (phase === "needs_role") {
    return buildDeferredDecision("needs_role");
  }
  if (phase === "talent_screening" && !assessment) {
    return buildDeferredDecision("talent_screening", context.jobTitle);
  }

  const fallback = heuristicDecision(talent, interview, assessment ?? null);

  const userPrompt = `Candidate: ${candidateName}
Role: ${context.jobTitle ?? "Assigned requisition"}
Talent signals: ${JSON.stringify(talent)}
Interview signals: ${JSON.stringify(interview)}
Assessment signals: ${JSON.stringify(assessment)}`;

  return chatJson<DecisionIntelligenceResult>(SYSTEM_PROMPT, userPrompt, fallback);
}
