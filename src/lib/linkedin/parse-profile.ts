import { chatJson } from "@/lib/intelligence/ai";

export type LinkedInParseResult = {
  normalizedText: string;
  headline: string | null;
  skills: string[];
};

const SECTION_MARKERS = [
  /^about$/i,
  /^experience$/i,
  /^education$/i,
  /^skills$/i,
  /^licenses/i,
  /^certifications$/i,
];

function cleanLinkedInPaste(raw: string): string {
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSkillsHeuristic(text: string): string[] {
  const skills: string[] = [];
  const skillsMatch = text.match(/(?:^|\n)skills?\s*\n([\s\S]*?)(?:\n[A-Z][a-z]+|\n*$)/i);
  if (!skillsMatch) return skills;

  for (const line of skillsMatch[1].split("\n")) {
    const token = line.replace(/^[•·\-*]\s*/, "").trim();
    if (token.length > 1 && token.length < 60 && !SECTION_MARKERS.some((m) => m.test(token))) {
      skills.push(token);
    }
  }
  return [...new Set(skills)].slice(0, 40);
}

function extractHeadlineHeuristic(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  const second = lines[1];
  if (second.length > 120) return null;
  if (SECTION_MARKERS.some((m) => m.test(second))) return null;
  return second;
}

type AiLinkedInShape = {
  normalizedText?: string;
  headline?: string;
  skills?: string[];
};

export async function parseLinkedInProfile(raw: string): Promise<LinkedInParseResult> {
  const cleaned = cleanLinkedInPaste(raw);
  if (cleaned.length < 40) {
    return { normalizedText: cleaned, headline: null, skills: [] };
  }

  const heuristicSkills = extractSkillsHeuristic(cleaned);
  const heuristicHeadline = extractHeadlineHeuristic(cleaned);

  const ai = await chatJson<AiLinkedInShape>(
    `You normalize LinkedIn profile exports into hiring intelligence context.
Return JSON: { "normalizedText": string, "headline": string|null, "skills": string[] }
Keep normalizedText as readable plain text for resume-style screening. Extract up to 30 skills.`,
    cleaned.slice(0, 12000),
    {
      normalizedText: cleaned,
      headline: heuristicHeadline ?? undefined,
      skills: heuristicSkills,
    }
  );

  const normalizedText = (ai.normalizedText ?? cleaned).trim();
  const skills = [...new Set((ai.skills ?? heuristicSkills).map((s) => s.trim()))].filter(
    Boolean
  );

  return {
    normalizedText,
    headline: ai.headline ?? heuristicHeadline,
    skills,
  };
}

export function isLinkedInProfileUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.toLowerCase();
    return host.includes("linkedin.com");
  } catch {
    return false;
  }
}
