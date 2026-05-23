import mammoth from "mammoth";

export const RESUME_UPLOAD = {
  maxBytes: 10 * 1024 * 1024,
  extensions: [".pdf", ".docx"] as const,
  mimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  minExtractedLength: 20,
  maxTextLength: 120_000,
};

export type ResumeFileFormat = "pdf" | "docx";

export function getResumeExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function isAllowedResumeFile(fileName: string, mimeType?: string): boolean {
  const ext = getResumeExtension(fileName);
  if (RESUME_UPLOAD.extensions.includes(ext as (typeof RESUME_UPLOAD.extensions)[number])) {
    return true;
  }
  if (mimeType && (RESUME_UPLOAD.mimeTypes as readonly string[]).includes(mimeType)) {
    return true;
  }
  return false;
}

export function normalizeResumeText(raw: string): string {
  return raw
    .replace(/\0/g, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, RESUME_UPLOAD.maxTextLength);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

export async function extractResumeText(
  buffer: Buffer,
  fileName: string
): Promise<{ text: string; format: ResumeFileFormat }> {
  const ext = getResumeExtension(fileName);

  let raw = "";
  let format: ResumeFileFormat;

  if (ext === ".pdf") {
    raw = await extractPdfText(buffer);
    format = "pdf";
  } else if (ext === ".docx") {
    raw = await extractDocxText(buffer);
    format = "docx";
  } else {
    throw new Error("UNSUPPORTED_FORMAT");
  }

  const text = normalizeResumeText(raw);
  return { text, format };
}
