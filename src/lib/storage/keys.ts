import path from "path";
import { randomBytes } from "crypto";

function safeExt(fileName: string, fallback: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext || fallback;
}

export function interviewRecordingKey(interviewId: string, fileName: string): string {
  return path.posix.join("interviews", `${interviewId}${safeExt(fileName, ".webm")}`);
}

export function resumeStorageKey(organizationId: string, fileName: string): string {
  const token = randomBytes(8).toString("hex");
  return path.posix.join("resumes", organizationId, `${token}${safeExt(fileName, ".pdf")}`);
}
