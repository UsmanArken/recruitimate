import { badRequest } from "@/lib/api/errors";
import {
  extractResumeText,
  isAllowedResumeFile,
  RESUME_UPLOAD,
} from "@/lib/resume/extract-text";
import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";

export async function parseResumeUpload(ctx: AuthContext, file: File) {
  await assertPermission(ctx, { resource: "candidates", action: "create" });

  if (!file || file.size === 0) {
    throw badRequest("No file provided", "NO_FILE");
  }

  if (file.size > RESUME_UPLOAD.maxBytes) {
    throw badRequest("File must be 10 MB or smaller", "FILE_TOO_LARGE");
  }

  if (!isAllowedResumeFile(file.name, file.type)) {
    throw badRequest("Only PDF and DOCX files are supported", "UNSUPPORTED_FORMAT");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extracted: Awaited<ReturnType<typeof extractResumeText>>;
  try {
    extracted = await extractResumeText(buffer, file.name);
  } catch {
    throw badRequest("Could not read this file. Try another PDF or DOCX.", "PARSE_FAILED");
  }

  if (extracted.text.length < RESUME_UPLOAD.minExtractedLength) {
    throw badRequest(
      "Too little text extracted. Paste resume content manually or use a text-based PDF.",
      "EMPTY_EXTRACT"
    );
  }

  const fileName = file.name.split(/[/\\]/).pop() ?? file.name;

  return {
    text: extracted.text,
    format: extracted.format,
    fileName,
    characterCount: extracted.text.length,
  };
}
