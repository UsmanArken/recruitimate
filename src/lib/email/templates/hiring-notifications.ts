import { pipelineStageLabel } from "@/lib/pipeline/stages";
import { appBaseUrl } from "@/lib/email/config";

export type StageChangeTemplateInput = {
  candidateName: string;
  jobTitle: string;
  fromStage: string;
  toStage: string;
  applicationId: string;
  candidateId: string;
  actorName?: string | null;
};

export type InterviewAnalyzedTemplateInput = {
  candidateName: string;
  jobTitle: string;
  interviewTitle: string;
  hireConfidence: number | null;
  recommendation: string | null;
  applicationId: string;
  candidateId: string;
};

function applicationUrl(candidateId: string, applicationId: string): string {
  return `${appBaseUrl()}/candidates/${candidateId}/applications/${applicationId}`;
}

export function buildStageChangeEmail(input: StageChangeTemplateInput) {
  const fromLabel = pipelineStageLabel(input.fromStage);
  const toLabel = pipelineStageLabel(input.toStage);
  const link = applicationUrl(input.candidateId, input.applicationId);
  const actor = input.actorName ? ` by ${input.actorName}` : "";

  const subject = `Pipeline update: ${input.candidateName} → ${toLabel}`;
  const text = [
    `Candidate ${input.candidateName} moved in your hiring pipeline${actor}.`,
    ``,
    `Role: ${input.jobTitle}`,
    `Stage: ${fromLabel} → ${toLabel}`,
    ``,
    `View application: ${link}`,
    ``,
    `— Recruitimate hiring notifications`,
  ].join("\n");

  return { subject, text };
}

export function buildInterviewAnalyzedEmail(input: InterviewAnalyzedTemplateInput) {
  const link = applicationUrl(input.candidateId, input.applicationId);
  const confidence =
    input.hireConfidence != null ? `${Math.round(input.hireConfidence * 100)}%` : "—";
  const recommendation = input.recommendation
    ? input.recommendation.replace(/_/g, " ")
    : "pending";

  const subject = `Interview analyzed: ${input.candidateName} (${input.jobTitle})`;
  const text = [
    `Interview intelligence is ready for ${input.candidateName}.`,
    ``,
    `Role: ${input.jobTitle}`,
    `Interview: ${input.interviewTitle}`,
    `Hire confidence: ${confidence}`,
    `Recommendation: ${recommendation}`,
    ``,
    `Review signals: ${link}`,
    ``,
    `— Recruitimate hiring notifications`,
  ].join("\n");

  return { subject, text };
}
