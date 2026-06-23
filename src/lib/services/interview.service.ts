import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { applicationDetailInclude } from "@/lib/db/includes";
import { badRequest, notFound } from "@/lib/api/errors";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { analyzeInterviewerQuality } from "@/lib/intelligence/interview/interviewer-quality-engine";
import { extractAudioSignals } from "@/lib/intelligence/audio/audio-signal-engine";
import { transcribeRecordingFile } from "@/lib/intelligence/transcription/whisper";
import { refreshApplicationIntelligence } from "@/lib/services/candidate-intelligence.service";
import {
  assertRecordingFile,
  saveInterviewRecording,
} from "@/lib/storage/interview-recordings";
import type {
  AnalyzeInterviewInput,
  CreateInterviewInput,
  ScheduleInterviewInput,
} from "@/lib/validators/interview";

async function loadApplicationForInterview(ctx: AuthContext, applicationId: string) {
  const { jobId } = await assertApplicationAccess(ctx, applicationId);
  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: { candidate: true, job: true, interviews: { include: { analysis: true } } },
  });
  if (!application) throw notFound("Application");
  return { application, jobId };
}

export async function listInterviewsForApplication(
  ctx: AuthContext,
  applicationId: string
) {
  await assertPermission(ctx, { resource: "interviews", action: "read" });
  await assertApplicationAccess(ctx, applicationId);

  return db.interview.findMany({
    where: { applicationId },
    include: { analysis: true },
    orderBy: { scheduledAt: "desc" },
  });
}

export async function scheduleInterview(
  ctx: AuthContext,
  applicationId: string,
  input: ScheduleInterviewInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  const { jobId } = await assertApplicationAccess(ctx, applicationId);
  await assertPermission(ctx, { resource: "interviews", action: "create", jobId });

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw badRequest("Invalid scheduled time", "INVALID_SCHEDULE");
  }

  const interview = await db.interview.create({
    data: {
      applicationId,
      title: input.title,
      status: "SCHEDULED",
      scheduledAt,
      durationMinutes: input.durationMinutes ?? 60,
      meetingUrl: input.meetingUrl || null,
    },
  });

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { stage: "INTERVIEW_SCHEDULED" },
  });

  return interview;
}

export async function handleCreateInterview(
  ctx: AuthContext,
  applicationId: string,
  input: CreateInterviewInput
) {
  if (input.action === "schedule") {
    return { type: "schedule" as const, interview: await scheduleInterview(ctx, applicationId, input) };
  }
  return {
    type: "analyze" as const,
    result: await createInterviewAndAnalyze(ctx, applicationId, input),
  };
}

export async function createInterviewAndAnalyze(
  ctx: AuthContext,
  applicationId: string,
  input: AnalyzeInterviewInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  const { application, jobId } = await loadApplicationForInterview(ctx, applicationId);
  await assertPermission(ctx, { resource: "interviews", action: "create", jobId });

  const intelligenceText = buildCandidateIntelligenceText(application.candidate);
  if (intelligenceText.length < 20) {
    throw badRequest("No resume or LinkedIn profile on file", "NO_PROFILE_TEXT");
  }

  const [analysis, interviewerQuality] = await Promise.all([
    analyzeInterview(input.transcript, intelligenceText),
    analyzeInterviewerQuality({
      transcript: input.transcript,
      jobTitle: application.job.title,
      jobRequirements: application.job.requirements,
    }),
  ]);

  const payload = analysisPayload(analysis, interviewerQuality);

  const existingAudio =
    input.interviewId
      ? (
          await db.interview.findFirst({
            where: { id: input.interviewId },
            select: { audioSignals: true, recordingPath: true },
          })
        )?.audioSignals
      : null;

  let audioSignals: Prisma.InputJsonValue | undefined = existingAudio as
    | Prisma.InputJsonValue
    | undefined;
  if (!audioSignals && input.interviewId) {
    const rec = await db.interview.findFirst({
      where: { id: input.interviewId },
      select: { recordingPath: true },
    });
    if (rec?.recordingPath) {
      try {
        audioSignals = (await extractAudioSignals(
          rec.recordingPath,
          input.transcript
        )) as Prisma.InputJsonValue;
      } catch {
        // optional enrichment
      }
    }
  }

  const interview = input.interviewId
    ? await db.interview.update({
        where: { id: input.interviewId },
        data: {
          title: input.title,
          status: "ANALYZED",
          transcript: input.transcript,
          audioSignals: audioSignals ?? undefined,
          analysis: {
            upsert: {
              create: payload,
              update: payload,
            },
          },
        },
        include: { analysis: true },
      })
    : await db.interview.create({
        data: {
          applicationId,
          title: input.title,
          status: "ANALYZED",
          transcript: input.transcript,
          analysis: { create: payload },
        },
        include: { analysis: true },
      });

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { stage: "INTERVIEWED" },
  });

  const full = await db.jobApplication.findFirst({
    where: { id: applicationId },
    include: applicationDetailInclude,
  });

  const { decision } = await refreshApplicationIntelligence({
    applicationId,
    candidateName: application.candidate.name,
    resumeText: intelligenceText,
    job: {
      id: application.jobId,
      title: full?.job.title ?? application.job.title,
      requirements: full?.job.requirements ?? application.job.requirements,
    },
    interviews: full?.interviews ?? [interview],
  });

  return { interview, decision };
}

function analysisPayload(
  analysis: Awaited<ReturnType<typeof analyzeInterview>>,
  interviewerQuality: Awaited<ReturnType<typeof analyzeInterviewerQuality>>
) {
  return {
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
}

export async function getInterviewForApplication(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string
) {
  await assertApplicationAccess(ctx, applicationId);
  const interview = await db.interview.findFirst({
    where: { id: interviewId, applicationId },
    include: { analysis: true, application: { include: { candidate: true, job: true } } },
  });
  if (!interview) throw notFound("Interview");
  return interview;
}

export async function uploadInterviewRecording(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string,
  file: File
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  await assertApplicationAccess(ctx, applicationId);

  assertRecordingFile(file);

  const interview = await db.interview.findFirst({
    where: { id: interviewId, applicationId },
  });
  if (!interview) throw notFound("Interview");

  const buffer = Buffer.from(await file.arrayBuffer());
  const recordingPath = await saveInterviewRecording(interviewId, buffer, file.name);

  return db.interview.update({
    where: { id: interviewId },
    data: { recordingPath, status: "RECORDED" },
  });
}

export async function transcribeInterviewRecording(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  await assertApplicationAccess(ctx, applicationId);

  const interview = await db.interview.findFirst({
    where: { id: interviewId, applicationId },
  });
  if (!interview) throw notFound("Interview");
  if (!interview.recordingPath) {
    throw badRequest("Upload a recording first", "NO_RECORDING");
  }

  const transcript = await transcribeRecordingFile(interview.recordingPath);

  let audioSignals: Prisma.InputJsonValue | undefined;
  try {
    audioSignals = (await extractAudioSignals(
      interview.recordingPath,
      transcript
    )) as Prisma.InputJsonValue;
  } catch {
    // Non-fatal — transcript still succeeds
  }

  return db.interview.update({
    where: { id: interviewId },
    data: { transcript, status: "TRANSCRIBED", audioSignals },
  });
}

export async function extractInterviewAudioSignals(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  await assertApplicationAccess(ctx, applicationId);

  const interview = await db.interview.findFirst({
    where: { id: interviewId, applicationId },
  });
  if (!interview) throw notFound("Interview");
  if (!interview.recordingPath) {
    throw badRequest("Upload a recording first", "NO_RECORDING");
  }

  const audioSignals = await extractAudioSignals(
    interview.recordingPath,
    interview.transcript
  );

  return db.interview.update({
    where: { id: interviewId },
    data: { audioSignals: audioSignals as Prisma.InputJsonValue },
  });
}

export async function analyzeInterviewById(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string
) {
  const interview = await getInterviewForApplication(ctx, applicationId, interviewId);
  if (!interview.transcript || interview.transcript.length < 50) {
    throw badRequest("Transcript too short — transcribe or paste first", "NO_TRANSCRIPT");
  }

  return createInterviewAndAnalyze(ctx, applicationId, {
    action: "analyze",
    title: interview.title,
    transcript: interview.transcript,
    interviewId: interview.id,
  });
}
