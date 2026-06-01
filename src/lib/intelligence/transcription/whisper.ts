import path from "path";
import { readFile } from "fs/promises";
import { badRequest, isAppError } from "@/lib/api/errors";
import { transcribeAudio } from "@/lib/llm";
import { absoluteRecordingPath } from "@/lib/storage/interview-recordings";

function mimeForPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".webm": "audio/webm",
    ".mp4": "video/mp4",
    ".mpeg": "audio/mpeg",
    ".mpga": "audio/mpeg",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function transcribeRecordingFile(relativePath: string): Promise<string> {
  const absolute = absoluteRecordingPath(relativePath);
  const buffer = await readFile(absolute);
  const fileName = path.basename(absolute);
  const mime = mimeForPath(absolute);

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
