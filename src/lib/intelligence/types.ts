export type Signal = {
  label: string;
  value: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
};

export type TalentIntelligenceResult = {
  skills: string[];
  experienceYears: number | null;
  /** Null when no open position / requirements are linked. */
  roleFitScore: number | null;
  strengths: string[];
  gaps: string[];
  hiddenSignals: Signal[];
  explanation: string;
};

export type InterviewIntelligenceResult = {
  hesitationScore: number;
  confidenceScore: number;
  clarityScore: number;
  consistencyScore: number;
  engagementScore: number;
  cognitiveSignals: Signal[];
  behavioralMetrics: Signal[];
  riskFlags: Signal[];
  explanation: string;
};

export type HireRecommendation =
  | "strong_yes"
  | "yes"
  | "maybe"
  | "no"
  | "strong_no"
  | "pending_role"
  | "pending_interview";

export type DecisionIntelligenceResult = {
  hireConfidence: number | null;
  recommendation: HireRecommendation;
  riskFactors: Signal[];
  explanation: string;
  signalBreakdown: {
    talentWeight: number;
    interviewWeight: number;
    talentScore: number;
    interviewScore: number;
  };
};
