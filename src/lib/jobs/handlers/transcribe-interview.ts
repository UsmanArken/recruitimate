import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { extractAudioSignals } from "@/lib/intelligence/audio/audio-signal-engine";
import { transcribeRecordingFile } from "@/lib/intelligence/transcription/whisper";
import type { TranscribeInterviewPayload } from "@/lib/jobs/types";

export async function executeTranscribeInterviewJob(
  organizationId: string,
  payload: TranscribeInterviewPayload
) {
  const interview = await db.interview.findFirst({
    where: {
      id: payload.interviewId,
      applicationId: payload.applicationId,
      application: { organizationId },
    },
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
    // optional enrichment
  }

  const updated = await db.interview.update({
    where: { id: interview.id },
    data: { transcript, status: "TRANSCRIBED", audioSignals },
  });

  return {
    interviewId: updated.id,
    transcript: updated.transcript,
    audioSignals: updated.audioSignals,
    status: updated.status,
  };
}
