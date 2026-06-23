import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import type { DiscoveryDocument, TalentDiscoverySource } from "../types";
import { extractSkillsFromText, parseExperienceYears } from "./skill-keywords";

export type DiscoveryCandidateFields = {
  name?: string;
  resumeText?: string | null;
  linkedInText?: string | null;
  linkedInUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
};

export type DiscoveryIngestInput = DiscoveryCandidateFields & {
  source: TalentDiscoverySource;
  email?: string | null;
};

const SOURCE_LABELS: Record<TalentDiscoverySource, string> = {
  manual: "Manual intake",
  resume: "Resume upload",
  linkedin: "LinkedIn profile",
  bulk: "Bulk import",
  external: "External source",
};

export function buildDiscoveryDocument(
  candidate: DiscoveryCandidateFields
): DiscoveryDocument {
  const searchDocument = buildCandidateIntelligenceText(candidate).trim();
  const searchSkills = extractSkillsFromText(searchDocument);
  const experienceYears = parseExperienceYears(searchDocument);

  return {
    searchDocument,
    searchSkills,
    experienceYears,
  };
}

export function discoveryIngestExplanation(
  source: TalentDiscoverySource,
  skillCount: number
): string {
  const label = SOURCE_LABELS[source];
  if (skillCount === 0) {
    return `${label} — indexed for discovery. Add resume or LinkedIn text to improve search signals.`;
  }
  return `${label} — indexed ${skillCount} skill signal${skillCount === 1 ? "" : "s"} for talent discovery.`;
}

export function mapPrismaSource(
  source: TalentDiscoverySource
): "MANUAL" | "RESUME" | "LINKEDIN" | "BULK" | "EXTERNAL" {
  const map = {
    manual: "MANUAL",
    resume: "RESUME",
    linkedin: "LINKEDIN",
    bulk: "BULK",
    external: "EXTERNAL",
  } as const;
  return map[source];
}

export function mapPrismaSourceToDiscovery(
  source: string
): TalentDiscoverySource {
  const map: Record<string, TalentDiscoverySource> = {
    MANUAL: "manual",
    RESUME: "resume",
    LINKEDIN: "linkedin",
    BULK: "bulk",
    EXTERNAL: "external",
  };
  return map[source] ?? "manual";
}
