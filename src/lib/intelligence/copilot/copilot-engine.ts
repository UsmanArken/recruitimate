import { chatJson, llmSetupHint, hasLlmProvider } from "../ai";
import type { CopilotChatResult } from "../types";
import { detectCopilotIntent } from "./intent-engine";
import { buildTopCandidatesReply, type PipelineCandidateRow } from "./top-candidates-handler";
import { compareCandidates, type CompareCandidateContext } from "./compare-handler";
import { summarizeInterview, type InterviewSummaryContext } from "./interview-summary-handler";

export type CopilotRunContext = {
  message: string;
  jobTitle?: string | null;
  pipeline?: PipelineCandidateRow[];
  compare?: [CompareCandidateContext, CompareCandidateContext] | null;
  interview?: InterviewSummaryContext | null;
};

const GENERAL_PROMPT = `You are Recruitimate's hiring copilot. Answer recruiting questions concisely.
You help with talent screening, interviews, assessments, and hire recommendations.
If you lack data, say what context the user should select (job, candidates, interview).
Output JSON: { "reply": string, "explanation": string }`;

export async function runCopilotChat(ctx: CopilotRunContext): Promise<CopilotChatResult> {
  const intent = detectCopilotIntent(ctx.message);

  if (intent === "top_candidates") {
    if (!ctx.jobTitle || !ctx.pipeline) {
      return needContext(
        "top_candidates",
        "Select an open role to rank candidates in that hiring campaign.",
        "Missing job context for top-candidates intent."
      );
    }
    return buildTopCandidatesReply(ctx.jobTitle, ctx.pipeline);
  }

  if (intent === "compare_candidates") {
    if (!ctx.compare || !ctx.jobTitle) {
      return needContext(
        "compare_candidates",
        "Select a role and two applicants to compare (use the dropdowns or ask after picking candidates).",
        "Missing compare context."
      );
    }
    return compareCandidates(ctx.jobTitle, ctx.compare[0], ctx.compare[1]);
  }

  if (intent === "interview_summary") {
    if (!ctx.interview) {
      return needContext(
        "interview_summary",
        "Select an applicant with a recorded/analyzed interview, or open their application page first.",
        "Missing interview context."
      );
    }
    return summarizeInterview(ctx.interview);
  }

  const fallback: CopilotChatResult = {
    intent: "general",
    reply: hasLlmProvider()
      ? "I can help rank pipeline candidates, compare two applicants, or summarize an interview. Try one of the suggested prompts."
      : `I can rank candidates, compare applicants, and summarize interviews using built-in signals. ${llmSetupHint()}`,
    citations: [],
    followUpSuggestions: [
      "Show top candidates for this role",
      "Why is candidate A better than B?",
      "Summarize this interview",
    ],
    explanation: "General copilot guidance.",
  };

  const llm = await chatJson<{ reply: string; explanation: string }>(
    GENERAL_PROMPT,
    `User: ${ctx.message}\nJob: ${ctx.jobTitle ?? "not selected"}`,
    { reply: fallback.reply, explanation: fallback.explanation }
  );

  return {
    intent: "general",
    reply: llm.reply,
    citations: [],
    followUpSuggestions: fallback.followUpSuggestions,
    explanation: llm.explanation,
  };
}

function needContext(
  intent: CopilotChatResult["intent"],
  reply: string,
  explanation: string
): CopilotChatResult {
  return {
    intent,
    reply,
    citations: [],
    followUpSuggestions: [
      "Show top candidates for this role",
      "Summarize this interview",
    ],
    explanation,
  };
}
