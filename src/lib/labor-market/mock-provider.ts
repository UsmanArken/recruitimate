import { extractSkillsFromText } from "@/lib/intelligence/talent/skill-keywords";
import type {
  LaborMarketJobContext,
  LaborMarketProvider,
  LaborMarketSearchResult,
  PassiveLeadFromMarket,
} from "./types";

const FIRST_NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Riley", "Casey", "Avery"];
const LAST_NAMES = ["Chen", "Patel", "Nguyen", "Kim", "Garcia", "Johnson", "Williams", "Lee"];
const LOCATIONS = ["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "London, UK"];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function scarceSkillScore(skills: string[]): number {
  const scarce = ["rust", "kubernetes", "machine learning", "distributed", "security"];
  const hits = skills.filter((s) => scarce.some((x) => s.includes(x)));
  return clamp01(hits.length / Math.max(1, scarce.length));
}

/**
 * Deterministic mock labor-market provider for development.
 * Generates plausible passive leads from job context — no real PII.
 */
export const mockLaborMarketProvider: LaborMarketProvider = {
  id: "mock",

  async searchPassiveCandidates(context: LaborMarketJobContext): Promise<LaborMarketSearchResult> {
    const reqSkills =
      context.skills.length > 0
        ? context.skills
        : extractSkillsFromText(`${context.title} ${context.requirements ?? ""}`);

    const seed = hashSeed(`${context.jobId}:${context.title}:${reqSkills.join(",")}`);
    const scarcity = scarceSkillScore(reqSkills);
    const demandScore = clamp01(0.45 + scarcity * 0.35 + (reqSkills.length > 3 ? 0.1 : 0));
    const poolEstimate = 40 + (seed % 120) + Math.round(reqSkills.length * 8);

    const leads: PassiveLeadFromMarket[] = [];
    const leadCount = 5 + (seed % 4);

    for (let i = 0; i < leadCount; i++) {
      const s = hashSeed(`${seed}:${i}`);
      const first = FIRST_NAMES[s % FIRST_NAMES.length];
      const last = LAST_NAMES[(s >> 4) % LAST_NAMES.length];
      const leadSkills = [
        ...reqSkills.slice(0, 2 + (s % 3)),
        ...extractSkillsFromText(context.title).slice(0, 1),
      ];
      const uniqueSkills = [...new Set(leadSkills)].filter(Boolean);
      const matchScore = clamp01(
        0.5 +
          (uniqueSkills.filter((sk) => reqSkills.includes(sk)).length /
            Math.max(1, reqSkills.length)) *
            0.4 +
          (s % 10) * 0.01
      );
      const openness = clamp01(0.35 + (s % 50) / 100);

      leads.push({
        externalRef: `mock-${context.jobId.slice(-6)}-${i}`,
        name: `${first} ${last}`,
        headline: `${context.title.split(" ")[0] ?? "Senior"} specialist · ${uniqueSkills.slice(0, 2).join(" & ") || "multi-stack"}`,
        location: LOCATIONS[s % LOCATIONS.length],
        skills: uniqueSkills.length ? uniqueSkills : reqSkills.slice(0, 3),
        opennessLikelihood: openness,
        marketDemandScore: demandScore,
        skillScarcity: scarcity,
        matchScore,
        explanation: `Mock passive signal — ${Math.round(openness * 100)}% openness likelihood, ${Math.round(matchScore * 100)}% skill match for ${context.title}.`,
      });
    }

    leads.sort((a, b) => b.matchScore - a.matchScore);

    return {
      provider: "mock",
      marketContext: {
        demandScore,
        talentPoolEstimate: poolEstimate,
        scarceSkills: reqSkills.filter((sk) =>
          ["rust", "kubernetes", "machine learning", "distributed", "security"].some((x) =>
            sk.includes(x)
          )
        ),
        averageOpenness: leads.reduce((sum, l) => sum + l.opennessLikelihood, 0) / leads.length,
        explanation: `Mock labor market — estimated ${poolEstimate} passive profiles match this role; demand index ${Math.round(demandScore * 100)}%.`,
      },
      leads,
    };
  },
};
