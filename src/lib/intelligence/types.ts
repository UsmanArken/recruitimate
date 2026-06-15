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

export type LiveAssistCategory = "probe" | "clarify" | "deepen";

export type LiveAssistPriority = "high" | "medium" | "low";

export type LiveAssistSuggestion = {
  id: string;
  question: string;
  rationale: string;
  category: LiveAssistCategory;
  priority: LiveAssistPriority;
};

export type LiveAssistResult = {
  suggestions: LiveAssistSuggestion[];
  momentSummary: string;
  explanation: string;
  /** P2-003 / P2-004 — resume vs live interview cross-signal mismatches */
  mismatchAlerts: MismatchAlert[];
  /** P2-002 — contradictions detected within the live transcript */
  inconsistencyFlags: InconsistencyFlag[];
  crossSignalSummary: string;
};

export type MismatchType =
  | "contradiction"
  | "unsupported_claim"
  | "experience_gap"
  | "skill_gap"
  | "timeline";

export type MismatchAlert = {
  id: string;
  label: string;
  resumeClaim: string;
  interviewStatement: string;
  evidence: string;
  confidence: Signal["confidence"];
  severity: LiveAssistPriority;
  type: MismatchType;
};

export type InconsistencyFlag = Signal & {
  severity: LiveAssistPriority;
};

export type InterviewQuestionCategory =
  | "technical"
  | "behavioral"
  | "situational"
  | "role_fit"
  | "culture";

export type InterviewQuestionDifficulty = "easy" | "medium" | "hard";

export type InterviewQuestion = {
  id: string;
  question: string;
  rationale: string;
  category: InterviewQuestionCategory;
  difficulty: InterviewQuestionDifficulty;
  probesFor: string;
};

export type InterviewQuestionBankResult = {
  questions: InterviewQuestion[];
  roleSummary: string;
  explanation: string;
};

export type InterviewerQualityResult = {
  coverageScore: number;
  probingScore: number;
  /** Higher = more potential bias patterns detected (advisory). */
  biasRiskScore: number;
  coverageGaps: Signal[];
  probingSignals: Signal[];
  biasFlags: Signal[];
  explanation: string;
};

export type AudioPauseSignal = {
  startSec: number;
  endSec: number;
  durationSec: number;
  label: string;
};

export type AudioToneShift = {
  atSec: number;
  fromLevel: "low" | "medium" | "high";
  toLevel: "low" | "medium" | "high";
  evidence: string;
};

export type AudioSignalSource = "wav_pcm" | "transcript_fallback";

export type AudioSignalResult = {
  source: AudioSignalSource;
  durationSec: number | null;
  pauseCount: number;
  avgPauseSec: number;
  longestPauseSec: number;
  pauses: AudioPauseSignal[];
  toneShifts: AudioToneShift[];
  /** 0–1 — higher = more frequent/longer pauses */
  pauseDensityScore: number;
  /** 0–1 — higher = more energy / tone variability */
  energyVariabilityScore: number;
  signals: Signal[];
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
