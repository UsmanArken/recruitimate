import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { badRequest } from "@/lib/api/errors";

export const INTERVIEW_RECORDING = {
  maxBytes: 25 * 1024 * 1024,
  allowedExtensions: [".mp3", ".wav", ".m4a", ".webm", ".mp4", ".mpeg", ".mpga"],
  allowedMimePrefixes: ["audio/", "video/"],
} as const;

function uploadRoot(): string {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

export function interviewRecordingDir(): string {
  return path.join(uploadRoot(), "interviews");
}

export function isAllowedRecordingFile(fileName: string, mimeType: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  if (INTERVIEW_RECORDING.allowedExtensions.includes(ext as (typeof INTERVIEW_RECORDING.allowedExtensions)[number])) {
    return true;
  }
  return INTERVIEW_RECORDING.allowedMimePrefixes.some((p) => mimeType.startsWith(p));
}

export async function saveInterviewRecording(
  interviewId: string,
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = path.extname(fileName).toLowerCase() || ".webm";
  const dir = interviewRecordingDir();
  await mkdir(dir, { recursive: true });
  const relative = path.join("interviews", `${interviewId}${ext}`);
  const absolute = path.join(uploadRoot(), relative);
  await writeFile(absolute, buffer);
  return relative;
}

export function absoluteRecordingPath(relativePath: string): string {
  return path.join(uploadRoot(), relativePath);
}

export function assertRecordingFile(file: File): void {
  if (!file || file.size === 0) {
    throw badRequest("No recording file provided", "NO_FILE");
  }
  if (file.size > INTERVIEW_RECORDING.maxBytes) {
    throw badRequest("Recording must be 25 MB or smaller", "FILE_TOO_LARGE");
  }
  if (!isAllowedRecordingFile(file.name, file.type || "")) {
    throw badRequest(
      "Unsupported format. Upload MP3, WAV, M4A, WEBM, or MP4.",
      "UNSUPPORTED_FORMAT"
    );
  }
}
