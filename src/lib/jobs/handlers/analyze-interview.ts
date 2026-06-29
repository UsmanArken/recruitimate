import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound, badRequest } from "@/lib/api/errors";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { applicationDetailInclude } from "@/lib/db/includes";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { analyzeInterviewerQuality } from "@/lib/intelligence/interview/interviewer-quality-engine";
import { extractAudioSignals } from "@/lib/intelligence/audio/audio-signal-engine";
import { refreshApplicationIntelligence } from "@/lib/services/candidate-intelligence.service";
import type { AnalyzeInterviewPayload } from "@/lib/jobs/types";

export async function executeAnalyzeInterviewJob(
  organizationId: string,
  payload: AnalyzeInterviewPayload
) {
  const interview = await db.interview.findFirst({
    where: {
      id: payload.interviewId,
      applicationId: payload.applicationId,
      application: { organizationId },
    },
    include: {
      application: { include: { candidate: true, job: true } },
    },
  });

  if (!interview) throw notFound("Interview");
  if (!interview.transcript || interview.transcript.length < 50) {
    throw badRequest("Transcript too short — transcribe or paste first", "NO_TRANSCRIPT");
  }

  const application = interview.application;
  const intelligenceText = buildCandidateIntelligenceText(application.candidate);
  if (intelligenceText.length < 20) {
    throw badRequest("No resume or LinkedIn profile on file", "NO_PROFILE_TEXT");
  }

  const [analysis, interviewerQuality] = await Promise.all([
    analyzeInterview(interview.transcript, intelligenceText),
    analyzeInterviewerQuality({
      transcript: interview.transcript,
      jobTitle: application.job.title,
      jobRequirements: application.job.requirements,
    }),
  ]);

  const analysisPayload = {
    hesitationScore: analysis.hesitationScore,
    confidenceScore: analysis.confidenceScore,
    clarityScore: analysis.clarityScore,
    consistencyScore: analysis.consistencyScore,
    engagementScore: analysis.engagementScore,
    cognitiveSignals: analysis.cognitiveSignals,
    behavioralMetrics: analysis.behavioralMetrics,
    riskFlags: analysis.riskFlags,
    explanation: analysis.explanation,
    interviewerQuality,
    rawAnalysis: { candidate: analysis, interviewer: interviewerQuality },
  };

  let audioSignals = interview.audioSignals as Prisma.InputJsonValue | undefined;
  if (!audioSignals && interview.recordingPath) {
    try {
      audioSignals = (await extractAudioSignals(
        interview.recordingPath,
        interview.transcript
      )) as Prisma.InputJsonValue;
    } catch {
      // optional
    }
  }

  const updatedInterview = await db.interview.update({
    where: { id: interview.id },
    data: {
      status: "ANALYZED",
      audioSignals: audioSignals ?? undefined,
      analysis: {
        upsert: {
          create: analysisPayload,
          update: analysisPayload,
        },
      },
    },
    include: { analysis: true },
  });

  await db.jobApplication.update({
    where: { id: application.id },
    data: { stage: "INTERVIEWED" },
  });

  const full = await db.jobApplication.findFirst({
    where: { id: application.id },
    include: applicationDetailInclude,
  });

  const { decision } = await refreshApplicationIntelligence({
    applicationId: application.id,
    candidateName: application.candidate.name,
    resumeText: intelligenceText,
    job: {
      id: application.jobId,
      title: full?.job.title ?? application.job.title,
      requirements: full?.job.requirements ?? application.job.requirements,
    },
    interviews: full?.interviews ?? [updatedInterview],
    organizationId: full?.organizationId ?? application.organizationId,
  });

  const { notifyInterviewAnalyzed } = await import("@/lib/services/notification.service");
  void notifyInterviewAnalyzed({
    organizationId: application.organizationId,
    applicationId: application.id,
    candidateId: application.candidateId,
    candidateName: application.candidate.name,
    jobId: application.jobId,
    jobTitle: full?.job.title ?? application.job.title,
    interviewTitle: updatedInterview.title,
    hireConfidence: decision.hireConfidence,
    recommendation: decision.recommendation,
  });

  return {
    interviewId: updatedInterview.id,
    status: updatedInterview.status,
    decision,
  };
}
