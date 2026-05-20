export type Signal = {
  label: string;
  value: string;
  evidence: string;
  confidence: "low" | "medium" | "high";
};

export type TalentIntelligenceResult = {
  skills: string[];
  experienceYears: number | null;
  roleFitScore: number;
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

export type DecisionIntelligenceResult = {
  hireConfidence: number;
  recommendation: "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
  riskFactors: Signal[];
  explanation: string;
  signalBreakdown: {
    talentWeight: number;
    interviewWeight: number;
    talentScore: number;
    interviewScore: number;
  };
};
