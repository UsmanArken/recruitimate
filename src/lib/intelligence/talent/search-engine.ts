import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { RankedCandidateResult, TalentSearchResult } from "../types";
import { extractSkillsFromText } from "./skill-keywords";

export type SearchableCandidate = {
  id: string;
  name: string;
  email: string | null;
  searchDocument: string;
  searchSkills: string[];
  experienceYears: number | null;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "with",
  "for",
  "and",
  "or",
  "find",
  "show",
  "me",
  "who",
  "has",
  "have",
  "engineers",
  "engineer",
  "developers",
  "developer",
  "candidates",
  "candidate",
  "people",
  "talent",
]);

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function scoreCandidate(
  candidate: SearchableCandidate,
  terms: string[],
  querySkills: string[]
): RankedCandidateResult {
  const docLower = candidate.searchDocument.toLowerCase();
  const skillSet = new Set(candidate.searchSkills.map((s) => s.toLowerCase()));

  const matchedTerms = terms.filter((t) => docLower.includes(t));
  const matchedSkills = querySkills.filter(
    (s) => skillSet.has(s) || docLower.includes(s)
  );

  const termScore = terms.length ? matchedTerms.length / terms.length : 0;
  const skillScore = querySkills.length ? matchedSkills.length / querySkills.length : 0;
  const nameBonus = terms.some((t) => candidate.name.toLowerCase().includes(t)) ? 0.1 : 0;
  const experienceBonus =
    candidate.experienceYears != null && candidate.experienceYears >= 5 ? 0.05 : 0;

  const matchScore = Math.min(
    0.98,
    0.25 + termScore * 0.35 + skillScore * 0.4 + nameBonus + experienceBonus
  );

  const parts: string[] = [];
  if (matchedSkills.length) {
    parts.push(`Skills: ${matchedSkills.slice(0, 5).join(", ")}`);
  }
  if (matchedTerms.length) {
    parts.push(`Matched: ${matchedTerms.slice(0, 4).join(", ")}`);
  }
  if (candidate.experienceYears != null) {
    parts.push(`${candidate.experienceYears}+ years indicated`);
  }

  return {
    candidateId: candidate.id,
    name: candidate.name,
    email: candidate.email,
    matchScore,
    matchedSkills,
    matchedTerms,
    experienceYears: candidate.experienceYears,
    explanation: parts.length ? parts.join(" · ") : "Limited overlap with query",
  };
}

function heuristicSearch(
  query: string,
  candidates: SearchableCandidate[],
  poolId: string | null,
  limit: number
): TalentSearchResult {
  const terms = tokenizeQuery(query);
  const querySkills = extractSkillsFromText(query);

  const ranked = candidates
    .map((c) => scoreCandidate(c, terms, querySkills))
    .filter((r) => r.matchScore >= 0.3)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return {
    query,
    parsedTerms: [...new Set([...terms, ...querySkills])],
    poolId,
    results: ranked,
    totalCandidates: candidates.length,
    explanation: heuristicExplanation(ranked.length),
  };
}

function heuristicExplanation(resultCount: number): string {
  if (!hasLlmProvider()) {
    return `Ranked ${resultCount} match${resultCount === 1 ? "" : "es"} via keyword + skill overlap (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Ranked ${resultCount} match${resultCount === 1 ? "" : "es"} via keyword + skill overlap (${provider} enhancement unavailable — using heuristics).`;
}

const SYSTEM_PROMPT = `You are Recruitimate's talent search ranker.
Given a natural language hiring query and candidate summaries, return JSON:
{
  "rankedIds": string[],
  "explanation": string
}
Order rankedIds by relevance. Only include IDs from the provided list.`;

type LlmSearchRank = { rankedIds: string[]; explanation: string };

export async function searchTalentCandidates(
  query: string,
  candidates: SearchableCandidate[],
  poolId: string | null,
  limit: number
): Promise<TalentSearchResult> {
  const fallback = heuristicSearch(query, candidates, poolId, limit);
  if (candidates.length === 0) {
    return {
      ...fallback,
      explanation: "No indexed candidates in this scope. Ingest profiles or run reindex.",
    };
  }

  const summaries = candidates.slice(0, 40).map((c) => ({
    id: c.id,
    name: c.name,
    skills: c.searchSkills.slice(0, 12),
    experienceYears: c.experienceYears,
    excerpt: c.searchDocument.slice(0, 400),
  }));

  const userPrompt = `Query: ${query}
Limit: ${limit}

Candidates:
${JSON.stringify(summaries, null, 2)}`;

  const llm = await chatJson<LlmSearchRank>(SYSTEM_PROMPT, userPrompt, {
    rankedIds: fallback.results.map((r) => r.candidateId),
    explanation: fallback.explanation,
  });

  const byId = new Map(candidates.map((c) => [c.id, c]));
  const terms = tokenizeQuery(query);
  const querySkills = extractSkillsFromText(query);

  const results: RankedCandidateResult[] = [];
  for (const id of llm.rankedIds) {
    const candidate = byId.get(id);
    if (!candidate) continue;
    results.push(scoreCandidate(candidate, terms, querySkills));
    if (results.length >= limit) break;
  }

  if (results.length === 0) {
    return fallback;
  }

  return {
    query,
    parsedTerms: fallback.parsedTerms,
    poolId,
    results,
    totalCandidates: candidates.length,
    explanation: llm.explanation || fallback.explanation,
  };
}
