/** Best-effort contact fields from raw resume text (no LLM). */

export function extractEmailFromResume(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0]?.toLowerCase();
}

function basename(fileName: string): string {
  return fileName.split(/[/\\]/).pop() ?? fileName;
}

/** Turn uploaded file name into a display-name fallback (no folder paths). */
export function fileNameToCandidateName(fileName: string): string {
  const base = basename(fileName).replace(/\.[^.]+$/i, "");
  let cleaned = base
    .replace(/[_\-]+/g, " ")
    .replace(/\b(resume|curriculum vitae|cv)\b/gi, " ")
    .replace(/\s+\d+\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").pop()?.trim() ?? cleaned;
  }

  return cleaned.length > 0 ? cleaned : "Candidate";
}

function looksLikePersonName(line: string): boolean {
  const cleaned = line.replace(/\s+/g, " ").trim();
  if (cleaned.length < 3 || cleaned.length > 48) return false;
  if (/[/\\@]/.test(cleaned)) return false;
  if (/\b(resume|curriculum|vitae|cv)\b/i.test(cleaned)) return false;
  if (/\d{4,}/.test(cleaned)) return false;

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;

  const nameLike = words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w));
  if (!nameLike) return false;

  const hasLower = words.some((w) => /[a-z]/.test(w));
  const hasUpper = words.some((w) => /[A-Z]/.test(w));
  return hasLower && hasUpper;
}

function extractEmbeddedPersonName(line: string): string | null {
  const titleCase = line.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s*$/);
  if (titleCase && looksLikePersonName(titleCase[1])) {
    return titleCase[1];
  }

  const words = line.split(/\s+/).filter(Boolean);
  for (let take = Math.min(4, words.length); take >= 2; take--) {
    const candidate = words.slice(-take).join(" ");
    if (looksLikePersonName(candidate)) return candidate;
  }

  return null;
}

export function extractNameFromResume(text: string, fallback: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  for (const line of lines.slice(0, 15)) {
    const embedded = extractEmbeddedPersonName(line);
    if (embedded) return embedded;
  }

  for (const line of lines.slice(0, 15)) {
    if (looksLikePersonName(line)) return line.replace(/\s+/g, " ");
  }

  const fromFile = fileNameToCandidateName(fallback);
  if (looksLikePersonName(fromFile)) return fromFile;

  const fileEmbedded = extractEmbeddedPersonName(fromFile);
  if (fileEmbedded) return fileEmbedded;

  return fromFile;
}

/** Preferred entry for imports: resume text + original upload file name. */
export function resolveCandidateDisplayName(resumeText: string, uploadFileName: string): string {
  return extractNameFromResume(resumeText, uploadFileName);
}

export function extractLinkedInUrlFromResume(text: string): string | undefined {
  const match = text.match(
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i
  );
  return match?.[0];
}

export function extractGithubUrlFromResume(text: string): string | undefined {
  const match = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i);
  return match?.[0];
}

export function extractPortfolioUrlFromResume(text: string): string | undefined {
  const lines = text.split("\n").slice(0, 20);
  for (const line of lines) {
    const match = line.match(/https?:\/\/[^\s]+/i);
    if (!match) continue;
    const url = match[0].replace(/[),.;]+$/, "");
    if (/linkedin\.com|github\.com|mailto:/i.test(url)) continue;
    return url;
  }
  return undefined;
}

export type ResumeContactHints = {
  suggestedName: string;
  suggestedEmail?: string;
  suggestedLinkedInUrl?: string;
  suggestedGithubUrl?: string;
  suggestedPortfolioUrl?: string;
};

export function extractResumeContactHints(
  text: string,
  fileName: string
): ResumeContactHints {
  return {
    suggestedName: resolveCandidateDisplayName(text, fileName),
    suggestedEmail: extractEmailFromResume(text),
    suggestedLinkedInUrl: extractLinkedInUrlFromResume(text),
    suggestedGithubUrl: extractGithubUrlFromResume(text),
    suggestedPortfolioUrl: extractPortfolioUrlFromResume(text),
  };
}
