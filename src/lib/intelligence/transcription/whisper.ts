import { readFile } from "fs/promises";
import path from "path";
import { badRequest } from "@/lib/api/errors";
import { getOpenAIClient } from "@/lib/intelligence/ai";
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
  const client = getOpenAIClient();
  if (!client) {
    throw badRequest(
      "OpenAI API key is required for Whisper transcription",
      "NO_OPENAI"
    );
  }

  const absolute = absoluteRecordingPath(relativePath);
  const buffer = await readFile(absolute);
  const fileName = path.basename(absolute);
  const mime = mimeForPath(absolute);

  const file = new File([buffer], fileName, { type: mime });

  const result = await client.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "text",
  });

  const text = typeof result === "string" ? result : String(result);
  const trimmed = text.trim();

  if (trimmed.length < 20) {
    throw badRequest(
      "Transcription was too short. Upload a clearer recording or paste a transcript.",
      "TRANSCRIPT_TOO_SHORT"
    );
  }

  return trimmed;
}
