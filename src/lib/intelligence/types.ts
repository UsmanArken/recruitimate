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

export type VideoBehavioralSample = {
  atSec: number;
  faceDetected: boolean;
  engagement: number;
  attention: number;
};

export type VideoBehavioralSource = "webcam_live" | "recording_playback" | "motion_fallback";

export type VideoBehavioralResult = {
  consentGiven: boolean;
  consentAt: string;
  candidateInformed: boolean;
  source: VideoBehavioralSource;
  durationSec: number;
  faceVisiblePercent: number;
  engagementScore: number;
  attentionScore: number;
  movementScore: number;
  sampleCount: number;
  samples: VideoBehavioralSample[];
  ethicalNotice: string;
  signals: Signal[];
  explanation: string;
};

export type TalentDiscoverySource =
  | "manual"
  | "resume"
  | "linkedin"
  | "bulk"
  | "external";

export type DiscoveryDocument = {
  searchDocument: string;
  searchSkills: string[];
  experienceYears: number | null;
};

export type TalentDiscoveryIngestResult = {
  candidateId: string;
  poolId: string | null;
  source: TalentDiscoverySource;
  searchSkills: string[];
  experienceYears: number | null;
  explanation: string;
};

export type RankedCandidateResult = {
  candidateId: string;
  name: string;
  email: string | null;
  matchScore: number;
  matchedSkills: string[];
  matchedTerms: string[];
  experienceYears: number | null;
  explanation: string;
};

export type TalentSearchResult = {
  query: string;
  parsedTerms: string[];
  poolId: string | null;
  results: RankedCandidateResult[];
  totalCandidates: number;
  explanation: string;
};

export type SuggestedCandidateResult = {
  candidateId: string;
  name: string;
  email: string | null;
  matchScore: number;
  matchedSkills: string[];
  strengths: string[];
  gaps: string[];
  experienceYears: number | null;
  alreadyApplied: boolean;
  explanation: string;
};

export type TalentSuggestResult = {
  jobId: string;
  jobTitle: string;
  suggestions: SuggestedCandidateResult[];
  corpusSize: number;
  explanation: string;
};

export type PassiveCandidateLeadResult = {
  id: string;
  externalRef: string;
  name: string;
  headline: string | null;
  location: string | null;
  skills: string[];
  opennessLikelihood: number;
  marketDemandScore: number;
  skillScarcity: number;
  matchScore: number;
  provider: string;
  explanation: string;
};

export type PassiveSignalsResult = {
  jobId: string;
  jobTitle: string;
  provider: string;
  marketContext: {
    demandScore: number;
    talentPoolEstimate: number;
    scarceSkills: string[];
    averageOpenness: number;
    explanation: string;
  };
  leads: PassiveCandidateLeadResult[];
  fetchedAt: string;
};

export type CareerRoleEntry = {
  title: string;
  company?: string;
  period?: string;
  seniorityLevel: number;
};

export type CareerTrajectoryResult = {
  growthConsistencyScore: number;
  tenureStabilityScore: number;
  promotionVelocity: "slow" | "steady" | "fast" | "unknown";
  rolesIdentified: CareerRoleEntry[];
  signals: Signal[];
  explanation: string;
};

export type OutreachTemplateVariables = {
  candidateName: string;
  candidateEmail?: string | null;
  jobTitle?: string | null;
  recruiterName?: string | null;
  companyName?: string | null;
};

export type OutreachRenderedMessage = {
  subject: string;
  bodyText: string;
  variablesUsed: string[];
};

export type OutreachPersonalizeResult = {
  subject: string;
  bodyText: string;
  tone: string;
  highlights: string[];
  explanation: string;
};

export type OutreachCampaignStats = {
  total: number;
  draft: number;
  generated: number;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  failed: number;
  openRate: number | null;
  replyRate: number | null;
};

export type OutreachTrackingEvent = {
  type: "sent" | "delivered" | "opened" | "replied" | "bounced" | "failed";
  at: string;
  snippet?: string;
  externalId?: string;
};

export type AssessmentTaskKind = "code" | "product" | "ops" | "scenario";

export type AssessmentDifficulty = "easy" | "medium" | "hard";

export type AssessmentRubricCriterion = {
  id: string;
  label: string;
  weight: number;
  description: string;
};

export type AssessmentTaskItem = {
  id: string;
  title: string;
  prompt: string;
  taskType: AssessmentTaskKind;
  difficulty: AssessmentDifficulty;
  rubric: AssessmentRubricCriterion[];
  skillsTested: string[];
  deliverables: string[];
  estimatedMinutes: number;
};

export type AssessmentTaskSetResult = {
  tasks: AssessmentTaskItem[];
  roleSummary: string;
  explanation: string;
};

export type AssessmentCriterionScore = {
  criterionId: string;
  label: string;
  score: number;
  feedback: string;
};

export type AssessmentEvaluationResult = {
  overallScore: number;
  criterionScores: AssessmentCriterionScore[];
  strengths: string[];
  gaps: string[];
  signals: Signal[];
  explanation: string;
};

export type AssessmentSignal = {
  overallScore: number;
};

export type CopilotIntent =
  | "top_candidates"
  | "compare_candidates"
  | "interview_summary"
  | "general";

export type CopilotCitation = {
  label: string;
  href?: string;
  detail?: string;
};

export type CopilotChatResult = {
  intent: CopilotIntent;
  reply: string;
  citations: CopilotCitation[];
  followUpSuggestions: string[];
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
    assessmentWeight: number;
    talentScore: number;
    interviewScore: number;
    assessmentScore: number;
  };
};
