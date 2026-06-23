import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { CopilotChatResult } from "../types";

export type CompareCandidateContext = {
  name: string;
  applicationId: string;
  candidateId: string;
  roleFitScore: number | null;
  hireConfidence: number | null;
  recommendation: string | null;
  strengths: string[];
  gaps: string[];
  interviewSummary?: string | null;
};

function heuristicCompare(a: CompareCandidateContext, b: CompareCandidateContext): CopilotChatResult {
  const scoreA = a.hireConfidence ?? a.roleFitScore ?? 0.5;
  const scoreB = b.hireConfidence ?? b.roleFitScore ?? 0.5;
  const leader = scoreA >= scoreB ? a : b;
  const other = leader === a ? b : a;
  const delta = Math.abs(scoreA - scoreB);

  const reply = `**${leader.name}** edges ahead for this role (${Math.round((leader.hireConfidence ?? leader.roleFitScore ?? 0) * 100)}% vs ${Math.round((other.hireConfidence ?? other.roleFitScore ?? 0) * 100)}%).

**${leader.name} strengths:** ${leader.strengths.slice(0, 3).join("; ") || "See talent profile"}
**${other.name} strengths:** ${other.strengths.slice(0, 3).join("; ") || "See talent profile"}

${delta < 0.08 ? "Scores are close — use interview depth and assessment results to break the tie." : "Gap is meaningful but not decisive; confirm with committee discussion."}`;

  return {
    intent: "compare_candidates",
    reply,
    citations: [
      { label: a.name, href: `/candidates/${a.candidateId}/applications/${a.applicationId}` },
      { label: b.name, href: `/candidates/${b.candidateId}/applications/${b.applicationId}` },
    ],
    followUpSuggestions: [`Summarize ${leader.name}'s interview`, "Show top candidates for this role"],
    explanation: heuristicExplanation(),
  };
}

function heuristicExplanation(): string {
  if (!hasLlmProvider()) {
    return `Heuristic comparison (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Heuristic comparison (${provider} enhancement unavailable).`;
}

const SYSTEM_PROMPT = `You are Recruitimate's hiring copilot comparing two candidates for the same role.
Be evidence-based using only the provided signals. Output JSON:
{
  "reply": string (markdown, concise),
  "explanation": string
}`;

export async function compareCandidates(
  jobTitle: string,
  a: CompareCandidateContext,
  b: CompareCandidateContext
): Promise<CopilotChatResult> {
  const fallback = heuristicCompare(a, b);

  const userPrompt = `Role: ${jobTitle}
Candidate A: ${JSON.stringify(a)}
Candidate B: ${JSON.stringify(b)}`;

  const llm = await chatJson<{ reply: string; explanation: string }>(
    SYSTEM_PROMPT,
    userPrompt,
    { reply: fallback.reply, explanation: fallback.explanation }
  );

  return {
    intent: "compare_candidates",
    reply: llm.reply || fallback.reply,
    citations: fallback.citations,
    followUpSuggestions: fallback.followUpSuggestions,
    explanation: llm.explanation || fallback.explanation,
  };
}
