import { db } from "@/lib/db";
import {
  candidateDetailInclude,
  candidateListInclude,
  candidateWithJobAndInterviewsInclude,
} from "@/lib/db/includes";
import { badRequest, notFound } from "@/lib/api/errors";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import { toInterviewIntelligenceResult } from "@/lib/intelligence/mappers";
import type { CreateCandidateInput } from "@/lib/validators/candidate";
import { findJobById } from "@/lib/services/job.service";
import { upsertTalentProfile } from "@/lib/services/talent-profile.service";
import { upsertDecision } from "@/lib/services/decision.service";

export async function listCandidates() {
  return db.candidate.findMany({
    include: candidateListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCandidateById(id: string) {
  const candidate = await db.candidate.findUnique({
    where: { id },
    include: candidateDetailInclude,
  });
  if (!candidate) throw notFound("Candidate");
  return candidate;
}

export async function createCandidate(input: CreateCandidateInput) {
  const job = input.jobId ? await findJobById(input.jobId) : null;

  const talent = await analyzeTalent(
    input.resumeText,
    job?.title,
    job?.requirements
  );
  const decision = await generateDecision(talent, null, input.name);

  return db.candidate.create({
    data: {
      name: input.name,
      email: input.email || null,
      jobId: input.jobId || null,
      resumeText: input.resumeText,
      linkedInUrl: input.linkedInUrl || null,
      githubUrl: input.githubUrl || null,
      stage: "TALENT_REVIEW",
      talentProfile: {
        create: {
          skills: talent.skills,
          experienceYears: talent.experienceYears,
          roleFitScore: talent.roleFitScore,
          strengths: talent.strengths,
          gaps: talent.gaps,
          hiddenSignals: talent.hiddenSignals,
          explanation: talent.explanation,
          rawAnalysis: talent,
        },
      },
      decision: {
        create: {
          hireConfidence: decision.hireConfidence,
          recommendation: decision.recommendation,
          riskFactors: decision.riskFactors,
          explanation: decision.explanation,
          signalBreakdown: decision.signalBreakdown,
        },
      },
    },
    include: candidateListInclude,
  });
}

export async function rerunTalentAnalysis(candidateId: string) {
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: candidateWithJobAndInterviewsInclude,
  });

  if (!candidate) throw notFound("Candidate");
  if (!candidate.resumeText) throw badRequest("No resume text on file", "NO_RESUME");

  const talent = await analyzeTalent(
    candidate.resumeText,
    candidate.job?.title,
    candidate.job?.requirements
  );

  await upsertTalentProfile(candidateId, talent);

  const latestWithAnalysis = candidate.interviews.find((i) => i.analysis);
  const interviewResult = latestWithAnalysis?.analysis
    ? toInterviewIntelligenceResult(latestWithAnalysis.analysis)
    : null;

  const decision = await generateDecision(talent, interviewResult, candidate.name);
  await upsertDecision(candidateId, decision);

  return { talent, decision };
}
