import { applyTalentContext, hasRoleContext } from "@/lib/intelligence/candidate-context";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import { toInterviewIntelligenceResult } from "@/lib/intelligence/mappers";
import type { TalentIntelligenceResult } from "@/lib/intelligence/types";
import { upsertTalentProfile } from "@/lib/services/talent-profile.service";
import { upsertDecision } from "@/lib/services/decision.service";

type JobContext = {
  id: string;
  title?: string | null;
  requirements?: string | null;
};

type InterviewRow = {
  analysis: Parameters<typeof toInterviewIntelligenceResult>[0] | null;
};

export async function computeTalentAndDecision(input: {
  candidateName: string;
  resumeText: string;
  job: JobContext;
  interviews: InterviewRow[];
}) {
  const hasRole = hasRoleContext(
    input.job.id,
    input.job.title,
    input.job.requirements
  );

  const rawTalent = await analyzeTalent(
    input.resumeText,
    input.job.title ?? undefined,
    input.job.requirements
  );
  const talent = applyTalentContext(rawTalent, hasRole);

  const latestWithAnalysis = input.interviews.find((i) => i.analysis);
  const interviewResult = latestWithAnalysis?.analysis
    ? toInterviewIntelligenceResult(latestWithAnalysis.analysis)
    : null;

  const decision = await generateDecision(talent, interviewResult, input.candidateName, {
    jobId: input.job.id,
    jobTitle: input.job.title,
  });

  return { talent, decision };
}

export async function refreshApplicationIntelligence(input: {
  applicationId: string;
  candidateName: string;
  resumeText: string;
  job: JobContext;
  interviews: InterviewRow[];
}) {
  const result = await computeTalentAndDecision(input);
  await upsertTalentProfile(input.applicationId, result.talent);
  await upsertDecision(input.applicationId, result.decision);
  return result;
}

export function talentForStorage(talent: TalentIntelligenceResult) {
  return {
    skills: talent.skills,
    experienceYears: talent.experienceYears,
    roleFitScore: talent.roleFitScore,
    strengths: talent.strengths,
    gaps: talent.gaps,
    hiddenSignals: talent.hiddenSignals,
    explanation: talent.explanation,
    rawAnalysis: talent,
  };
}
