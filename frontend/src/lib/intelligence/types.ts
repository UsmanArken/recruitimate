export interface Signal {
  label: string;
  confidence: "high" | "medium" | "low";
  value: string;
  evidence: string;
}

export interface PauseEvent {
  startSec: number;
  endSec: number;
  durationSec: number;
  label: string;
}

export interface ToneShift {
  atSec: number;
  fromLevel: string;
  toLevel: string;
  evidence: string;
}

export interface AudioSignalResult {
  pauseCount: number;
  pauseDensityScore: number;
  energyVariabilityScore: number;
  longestPauseSec: number;
  source: string;
  pauses: PauseEvent[];
  toneShifts: ToneShift[];
  signals: Signal[];
  explanation?: string | null;
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

export interface VideoBehavioralResult {
  engagementScore: number;
  attentionScore: number;
  faceVisiblePercent: number;
  sampleCount: number;
  durationSec: number;
  source: "webcam_live" | "recording_playback" | "motion_fallback";
  consentGiven: boolean;
  consentAt: string;
  ethicalNotice: string;
  signals: Signal[];
  explanation?: string | null;
}
