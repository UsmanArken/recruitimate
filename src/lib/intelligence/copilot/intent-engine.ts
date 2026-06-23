import type { CopilotIntent } from "../types";

export function detectCopilotIntent(message: string): CopilotIntent {
  const lower = message.toLowerCase();

  if (
    (lower.includes("summarize") || lower.includes("summary") || lower.includes("recap")) &&
    lower.includes("interview")
  ) {
    return "interview_summary";
  }

  if (
    lower.includes("better than") ||
    lower.includes("compare") ||
    lower.includes(" versus ") ||
    lower.includes(" vs ") ||
    (lower.includes("why") && (lower.includes("than") || lower.includes("over")))
  ) {
    return "compare_candidates";
  }

  if (
    lower.includes("top candidate") ||
    lower.includes("best candidate") ||
    lower.includes("show candidate") ||
    lower.includes("who should") ||
    lower.includes("rank candidate") ||
    lower.includes("shortlist")
  ) {
    return "top_candidates";
  }

  return "general";
}

export const COPILOT_STARTER_PROMPTS = [
  "Show top candidates for this role",
  "Why is candidate A better than B?",
  "Summarize this interview",
] as const;
