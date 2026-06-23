import { pipelineStageLabel } from "@/lib/pipeline/stages";

export type CandidateBrief = {
  candidateName: string;
  candidateEmail: string | null;
  jobTitle: string;
  stage: string;
  stageLabel: string;
  generatedAt: string;
  roleFitScore: number | null;
  hireConfidence: number | null;
  recommendation: string | null;
  talentSummary: string | null;
  strengths: string[];
  gaps: string[];
  interviewTitle: string | null;
  interviewSummary: string | null;
  interviewScores: {
    confidence: number | null;
    clarity: number | null;
    consistency: number | null;
  };
  riskFactors: string[];
  decisionExplanation: string | null;
  signalBreakdown: {
    talentWeight?: number;
    interviewWeight?: number;
    assessmentWeight?: number;
    talentScore?: number;
    interviewScore?: number;
    assessmentScore?: number;
  } | null;
};

type ApplicationBundle = {
  stage: string;
  candidate: { name: string; email: string | null };
  job: { title: string };
  talentProfile: {
    roleFitScore: number | null;
    explanation: string | null;
    strengths: unknown;
    gaps: unknown;
  } | null;
  decision: {
    hireConfidence: number | null;
    recommendation: string | null;
    explanation: string | null;
    riskFactors: unknown;
    signalBreakdown: unknown;
  } | null;
  interviews: {
    title: string;
    analysis: {
      explanation: string | null;
      confidenceScore: number | null;
      clarityScore: number | null;
      consistencyScore: number | null;
    } | null;
  }[];
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value?: string }).value ?? "");
      }
      return "";
    })
    .filter(Boolean);
}

export function buildCandidateBrief(application: ApplicationBundle): CandidateBrief {
  const latestInterview = application.interviews[0];
  const analysis = latestInterview?.analysis;

  return {
    candidateName: application.candidate.name,
    candidateEmail: application.candidate.email,
    jobTitle: application.job.title,
    stage: application.stage,
    stageLabel: pipelineStageLabel(application.stage),
    generatedAt: new Date().toISOString(),
    roleFitScore: application.talentProfile?.roleFitScore ?? null,
    hireConfidence: application.decision?.hireConfidence ?? null,
    recommendation: application.decision?.recommendation ?? null,
    talentSummary: application.talentProfile?.explanation ?? null,
    strengths: asStringList(application.talentProfile?.strengths),
    gaps: asStringList(application.talentProfile?.gaps),
    interviewTitle: latestInterview?.title ?? null,
    interviewSummary: analysis?.explanation ?? null,
    interviewScores: {
      confidence: analysis?.confidenceScore ?? null,
      clarity: analysis?.clarityScore ?? null,
      consistency: analysis?.consistencyScore ?? null,
    },
    riskFactors: asStringList(application.decision?.riskFactors),
    decisionExplanation: application.decision?.explanation ?? null,
    signalBreakdown: (application.decision?.signalBreakdown as CandidateBrief["signalBreakdown"]) ?? null,
  };
}

export function formatRecommendation(value: string | null): string {
  if (!value) return "—";
  return value.replace(/_/g, " ");
}

export function formatPercent(score: number | null): string {
  if (score == null) return "—";
  return `${Math.round(score * 100)}%`;
}
