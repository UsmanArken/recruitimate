export interface Signal {
  label: string;
  confidence: "high" | "medium" | "low";
  value: string;
  evidence: string;
}

export interface InterviewerQualityResult {
  coverageScore: number;
  probingScore: number;
  biasRiskScore: number;
  coverageGaps: Signal[];
  probingSignals: Signal[];
  biasFlags: Signal[];
  explanation?: string | null;
}

export type InterviewQuestionCategory =
  | "technical"
  | "behavioral"
  | "situational"
  | "role_fit"
  | "culture";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: InterviewQuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  rationale: string;
  probesFor: string;
}

export interface InterviewQuestionBankResult {
  roleSummary: string;
  questions: InterviewQuestion[];
  explanation?: string | null;
}

export interface LiveAssistSuggestion {
  id: string;
  question: string;
  category: "probe" | "clarify" | "deepen";
  priority: "high" | "medium" | "low";
  rationale: string;
}

export interface MismatchAlert {
  id: string;
  label: string;
  type:
    | "contradiction"
    | "unsupported_claim"
    | "experience_gap"
    | "skill_gap"
    | "timeline";
  severity: "high" | "medium" | "low";
  resumeClaim: string;
  interviewStatement: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
}

export interface InconsistencyFlag {
  label: string;
  severity: "high" | "medium" | "low";
  value: string;
  evidence: string;
}

export interface LiveAssistResult {
  momentSummary: string;
  crossSignalSummary: string;
  mismatchAlerts: MismatchAlert[];
  inconsistencyFlags: InconsistencyFlag[];
  suggestions: LiveAssistSuggestion[];
  explanation?: string | null;
}
