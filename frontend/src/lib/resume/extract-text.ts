const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export function isAllowedResumeFile(name: string, mimeType?: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) return true;
  if (mimeType && ALLOWED_MIME_TYPES.includes(mimeType)) return true;
  return false;
}
