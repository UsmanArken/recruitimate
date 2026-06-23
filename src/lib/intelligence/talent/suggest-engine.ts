import { analyzeTalent } from "./engine";
import type { SuggestedCandidateResult, TalentSuggestResult } from "../types";
import { extractSkillsFromText } from "./skill-keywords";

export type SuggestableCandidate = {
  id: string;
  name: string;
  email: string | null;
  searchDocument: string;
  searchSkills: string[];
  experienceYears: number | null;
  alreadyApplied: boolean;
};

function heuristicSuggestScore(
  candidate: SuggestableCandidate,
  jobRequirements: string,
  jobTitle: string
): SuggestedCandidateResult {
  const reqLower = jobRequirements.toLowerCase();
  const titleLower = jobTitle.toLowerCase();
  const reqSkills = extractSkillsFromText(`${jobRequirements} ${jobTitle}`);

  const matchedSkills = candidate.searchSkills.filter(
    (s) => reqLower.includes(s) || titleLower.includes(s)
  );
  const docMatched = reqSkills.filter((s) =>
    candidate.searchDocument.toLowerCase().includes(s)
  );
  const allMatched = [...new Set([...matchedSkills, ...docMatched])];

  const skillScore = reqSkills.length ? allMatched.length / reqSkills.length : 0.3;
  const experienceBonus =
    candidate.experienceYears != null && candidate.experienceYears >= 3 ? 0.1 : 0;
  const matchScore = Math.min(0.95, 0.35 + skillScore * 0.5 + experienceBonus);

  const strengths = allMatched.slice(0, 4).map((s) => `Demonstrated ${s} experience`);
  const gaps =
    reqSkills.length > allMatched.length
      ? ["Verify depth on remaining role requirements in screening"]
      : [];

  return {
    candidateId: candidate.id,
    name: candidate.name,
    email: candidate.email,
    matchScore,
    matchedSkills: allMatched,
    strengths: strengths.length ? strengths : ["Profile indexed in talent corpus"],
    gaps,
    experienceYears: candidate.experienceYears,
    alreadyApplied: candidate.alreadyApplied,
    explanation: allMatched.length
      ? `Heuristic fit — overlaps on ${allMatched.slice(0, 4).join(", ")}`
      : "Heuristic fit — limited skill overlap; review full profile",
  };
}

export async function suggestCandidatesForJob(
  jobId: string,
  jobTitle: string,
  jobRequirements: string | null,
  candidates: SuggestableCandidate[],
  limit: number
): Promise<TalentSuggestResult> {
  const eligible = candidates.filter((c) => !c.alreadyApplied && c.searchDocument.length >= 20);
  const requirements = jobRequirements?.trim() ?? jobTitle;

  if (eligible.length === 0) {
    return {
      jobId,
      jobTitle,
      suggestions: [],
      corpusSize: candidates.length,
      explanation: "No eligible internal candidates outside this role's pipeline.",
    };
  }

  const scored: SuggestedCandidateResult[] = [];

  for (const candidate of eligible.slice(0, Math.min(eligible.length, limit * 3))) {
    if (!hasLlmBudget()) {
      scored.push(heuristicSuggestScore(candidate, requirements, jobTitle));
      continue;
    }

    try {
      const talent = await analyzeTalent(candidate.searchDocument, jobTitle, requirements);
      const matchedSkills = talent.skills.filter((s) =>
        requirements.toLowerCase().includes(s.toLowerCase())
      );
      scored.push({
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        matchScore: talent.roleFitScore ?? heuristicSuggestScore(candidate, requirements, jobTitle).matchScore,
        matchedSkills: matchedSkills.length ? matchedSkills : talent.skills.slice(0, 5),
        strengths: talent.strengths.slice(0, 4),
        gaps: talent.gaps.slice(0, 3),
        experienceYears: talent.experienceYears ?? candidate.experienceYears,
        alreadyApplied: false,
        explanation: talent.explanation,
      });
    } catch {
      scored.push(heuristicSuggestScore(candidate, requirements, jobTitle));
    }
  }

  const suggestions = scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return {
    jobId,
    jobTitle,
    suggestions,
    corpusSize: candidates.length,
    explanation: `Suggested ${suggestions.length} internal candidate${suggestions.length === 1 ? "" : "s"} from ${eligible.length} eligible profiles.`,
  };
}

function hasLlmBudget(): boolean {
  return Boolean(
    process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.GOOGLE_API_KEY
  );
}
