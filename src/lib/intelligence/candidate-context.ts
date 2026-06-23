import type { DecisionIntelligenceResult, TalentIntelligenceResult } from "./types";

/** When the product can honestly show each intelligence layer. */
export type IntelligencePhase =
  | "needs_role"
  | "talent_screening"
  | "ready_for_decision";

export function getIntelligencePhase(
  jobId: string | null | undefined,
  hasInterviewAnalysis: boolean
): IntelligencePhase {
  if (!jobId) return "needs_role";
  if (!hasInterviewAnalysis) return "talent_screening";
  return "ready_for_decision";
}

export function hasRoleContext(
  jobId: string | null | undefined,
  jobTitle?: string | null,
  jobRequirements?: string | null
): boolean {
  if (!jobId) return false;
  return Boolean(jobTitle?.trim() || jobRequirements?.trim());
}

export function buildDeferredDecision(
  phase: Exclude<IntelligencePhase, "ready_for_decision">,
  jobTitle?: string | null
): DecisionIntelligenceResult {
  if (phase === "needs_role") {
    return {
      hireConfidence: null,
      recommendation: "pending_role",
      riskFactors: [
        {
          label: "Missing hiring context",
          value: "Applicant is not linked to an open position",
          evidence:
            "Role fit and hire recommendations require a requisition with requirements",
          confidence: "high",
        },
      ],
      explanation:
        "This applicant is in your talent pool only. Assign them to an open position (hiring campaign) to score role fit and generate a hire recommendation.",
      signalBreakdown: {
        talentWeight: 0,
        interviewWeight: 0,
        assessmentWeight: 0,
        talentScore: 0,
        interviewScore: 0,
        assessmentScore: 0,
      },
    };
  }

  return {
    hireConfidence: null,
    recommendation: "pending_interview",
    riskFactors: [
      {
        label: "Interview required",
        value: `Screening for ${jobTitle ?? "this role"} — no interview analyzed yet`,
        evidence: "Decision layer combines resume match with interview signals",
        confidence: "high",
      },
    ],
    explanation:
      "Preliminary resume screening is complete. Record an interview to unlock hire confidence and an advisory recommendation for your hiring committee.",
    signalBreakdown: {
      talentWeight: 1,
      interviewWeight: 0,
      assessmentWeight: 0,
      talentScore: 0,
      interviewScore: 0,
      assessmentScore: 0,
    },
  };
}

/** Normalize talent output when no requisition is linked. */
export function applyTalentContext(
  talent: TalentIntelligenceResult,
  hasRole: boolean
): TalentIntelligenceResult {
  if (hasRole) return talent;
  return {
    ...talent,
    roleFitScore: null,
    gaps: [
      "Link this applicant to an open position to compare skills against role requirements",
      ...(talent.gaps ?? []).filter((g) => !g.toLowerCase().includes("no job")),
    ],
    explanation:
      "Resume screening complete. Role fit scoring requires an open position — assign a hiring campaign to continue.",
  };
}
