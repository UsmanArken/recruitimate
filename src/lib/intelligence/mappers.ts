import type { InterviewAnalysis, TalentProfile } from "@prisma/client";
import type {
  InterviewIntelligenceResult,
  TalentIntelligenceResult,
} from "@/lib/intelligence/types";

export function toTalentIntelligenceResult(
  profile: TalentProfile | null | undefined
): TalentIntelligenceResult | null {
  if (!profile) return null;
  return {
    skills: profile.skills as string[],
    experienceYears: profile.experienceYears,
    roleFitScore: profile.roleFitScore ?? 0.5,
    strengths: profile.strengths as string[],
    gaps: profile.gaps as string[],
    hiddenSignals: profile.hiddenSignals as TalentIntelligenceResult["hiddenSignals"],
    explanation: profile.explanation ?? "",
  };
}

export function toInterviewIntelligenceResult(
  analysis: InterviewAnalysis
): InterviewIntelligenceResult {
  return {
    hesitationScore: analysis.hesitationScore ?? 0.5,
    confidenceScore: analysis.confidenceScore ?? 0.5,
    clarityScore: analysis.clarityScore ?? 0.5,
    consistencyScore: analysis.consistencyScore ?? 0.5,
    engagementScore: analysis.engagementScore ?? 0.5,
    cognitiveSignals: analysis.cognitiveSignals as InterviewIntelligenceResult["cognitiveSignals"],
    behavioralMetrics: analysis.behavioralMetrics as InterviewIntelligenceResult["behavioralMetrics"],
    riskFlags: analysis.riskFlags as InterviewIntelligenceResult["riskFlags"],
    explanation: analysis.explanation ?? "",
  };
}
