import path from "path";
import { badRequest, isAppError } from "@/lib/api/errors";
import { transcribeAudio } from "@/lib/llm";
import { readInterviewRecording, mimeForPath } from "@/lib/storage/interview-recordings";

export async function transcribeRecordingFile(storageKey: string): Promise<string> {
  const buffer = await readInterviewRecording(storageKey);
  const fileName = path.basename(storageKey);
  const mime = mimeForPath(storageKey);

  let text: string;
  try {
    text = await transcribeAudio({ buffer, fileName, mimeType: mime });
  } catch (error) {
    if (isAppError(error)) throw error;
    throw badRequest("Transcription failed", "TRANSCRIPTION_FAILED");
  }

  const trimmed = text.trim();
  if (trimmed.length < 20) {
    throw badRequest(
      "Transcription was too short. Upload a clearer recording or paste a transcript.",
      "TRANSCRIPT_TOO_SHORT"
    );
  }

  return trimmed;
}
