import type { CopilotChatResult } from "../types";

export type PipelineCandidateRow = {
  applicationId: string;
  candidateId: string;
  name: string;
  roleFitScore: number | null;
  hireConfidence: number | null;
  recommendation: string | null;
  strengths: string[];
};

export function buildTopCandidatesReply(
  jobTitle: string,
  candidates: PipelineCandidateRow[],
  limit = 5
): CopilotChatResult {
  const ranked = [...candidates]
    .sort((a, b) => {
      const aScore = a.hireConfidence ?? a.roleFitScore ?? 0;
      const bScore = b.hireConfidence ?? b.roleFitScore ?? 0;
      return bScore - aScore;
    })
    .slice(0, limit);

  if (ranked.length === 0) {
    return {
      intent: "top_candidates",
      reply: `No applicants are in review for ${jobTitle} yet. Add candidates to this open role to rank them here.`,
      citations: [],
      followUpSuggestions: ["Compare two candidates once the pipeline has applicants"],
      explanation: "Ranked from empty pipeline for the selected role.",
    };
  }

  const lines = ranked.map((c, i) => {
    const score = c.hireConfidence ?? c.roleFitScore;
    const pct = score != null ? `${Math.round(score * 100)}%` : "—";
    const rec = c.recommendation ? ` (${c.recommendation.replace(/_/g, " ")})` : "";
    return `${i + 1}. **${c.name}** — ${pct} fit${rec}`;
  });

  return {
    intent: "top_candidates",
    reply: `Top candidates for **${jobTitle}**:\n\n${lines.join("\n")}\n\nAdvisory ranking from talent + interview + decision signals in your pipeline.`,
    citations: ranked.map((c) => ({
      label: c.name,
      href: `/candidates/${c.candidateId}/applications/${c.applicationId}`,
      detail: c.strengths[0],
    })),
    followUpSuggestions: [
      `Why is ${ranked[0]?.name} a strong fit?`,
      ranked.length > 1 ? `Compare ${ranked[0]?.name} vs ${ranked[1]?.name}` : "Summarize the latest interview",
    ],
    explanation: `Ranked ${ranked.length} pipeline applicants by hire confidence / role fit.`,
  };
}
