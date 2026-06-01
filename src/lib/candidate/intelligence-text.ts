/** Combined text fed into talent / interview engines. */
export function buildCandidateIntelligenceText(candidate: {
  resumeText?: string | null;
  linkedInText?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
}): string {
  const parts: string[] = [];

  if (candidate.resumeText?.trim()) {
    parts.push(candidate.resumeText.trim());
  }
  if (candidate.linkedInText?.trim()) {
    parts.push(`--- LinkedIn profile ---\n${candidate.linkedInText.trim()}`);
  }
  if (candidate.githubUrl?.trim()) {
    parts.push(`GitHub: ${candidate.githubUrl.trim()}`);
  }
  if (candidate.portfolioUrl?.trim()) {
    parts.push(`Portfolio: ${candidate.portfolioUrl.trim()}`);
  }

  return parts.join("\n\n");
}
