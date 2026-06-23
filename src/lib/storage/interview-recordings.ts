import path from "path";
import { badRequest } from "@/lib/api/errors";
import { interviewRecordingKey } from "./keys";
import { getMediaObject, putMediaObject } from "./provider";
import { localAbsolutePath } from "./local-provider";
import { resolveStorageProviderId } from "./config";

export const INTERVIEW_RECORDING = {
  maxBytes: 25 * 1024 * 1024,
  allowedExtensions: [".mp3", ".wav", ".m4a", ".webm", ".mp4", ".mpeg", ".mpga"],
  allowedMimePrefixes: ["audio/", "video/"],
} as const;

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
  const key = interviewRecordingKey(interviewId, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const contentType = mimeForExtension(ext || ".webm");
  await putMediaObject(key, buffer, contentType);
  return key;
}

export async function readInterviewRecording(key: string): Promise<Buffer> {
  return getMediaObject(key);
}

/** Local dev helper — only valid when STORAGE_PROVIDER=local. */
export function absoluteRecordingPath(key: string): string {
  if (resolveStorageProviderId() !== "local") {
    throw new Error("absoluteRecordingPath is only available for local storage");
  }
  return localAbsolutePath(key);
}

export function mimeForExtension(ext: string): string {
  const map: Record<string, string> = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".webm": "audio/webm",
    ".mp4": "video/mp4",
    ".mpeg": "audio/mpeg",
    ".mpga": "audio/mpeg",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export function mimeForPath(filePath: string): string {
  return mimeForExtension(path.extname(filePath).toLowerCase());
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
