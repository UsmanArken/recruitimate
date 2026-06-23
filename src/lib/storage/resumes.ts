import path from "path";
import { resumeStorageKey } from "./keys";
import { putMediaObject } from "./provider";
import { mimeForExtension } from "./interview-recordings";

export async function saveResumeFile(
  organizationId: string,
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const key = resumeStorageKey(organizationId, fileName);
  const ext = path.extname(fileName).toLowerCase() || ".pdf";
  await putMediaObject(key, buffer, mimeForExtension(ext));
  return key;
}
