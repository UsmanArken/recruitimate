import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { CopilotChatResult } from "../types";

export type InterviewSummaryContext = {
  candidateName: string;
  jobTitle: string;
  interviewTitle: string;
  transcript?: string | null;
  analysisExplanation?: string | null;
  confidenceScore?: number | null;
  clarityScore?: number | null;
  consistencyScore?: number | null;
  riskFlags?: string[];
};

function heuristicSummary(ctx: InterviewSummaryContext): CopilotChatResult {
  const parts: string[] = [
    `**${ctx.candidateName}** — ${ctx.interviewTitle} for ${ctx.jobTitle}`,
  ];

  if (ctx.confidenceScore != null) {
    parts.push(
      `Interview signals: confidence ${Math.round(ctx.confidenceScore * 100)}%, clarity ${Math.round((ctx.clarityScore ?? 0) * 100)}%, consistency ${Math.round((ctx.consistencyScore ?? 0) * 100)}%.`
    );
  }

  if (ctx.analysisExplanation) {
    parts.push(ctx.analysisExplanation);
  } else if (ctx.transcript) {
    const excerpt = ctx.transcript.slice(0, 400).trim();
    parts.push(`Transcript excerpt: "${excerpt}${ctx.transcript.length > 400 ? "…" : ""}"`);
  } else {
    parts.push("No transcript or analysis available yet — record and analyze the interview first.");
  }

  if (ctx.riskFlags?.length) {
    parts.push(`Follow-up suggested: ${ctx.riskFlags.slice(0, 2).join("; ")}`);
  }

  return {
    intent: "interview_summary",
    reply: parts.join("\n\n"),
    citations: [],
    followUpSuggestions: ["Compare this candidate to another finalist", "Show top candidates for this role"],
    explanation: heuristicExplanation(),
  };
}

function heuristicExplanation(): string {
  if (!hasLlmProvider()) {
    return `Heuristic summary (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Heuristic summary (${provider} call failed — using analysis signals).`;
}

const SYSTEM_PROMPT = `You are Recruitimate's interview summary copilot.
Summarize the interview for a hiring manager in 3-5 bullet points. Cite evidence from transcript when available.
Output JSON: { "reply": string (markdown), "explanation": string }`;

export async function summarizeInterview(ctx: InterviewSummaryContext): Promise<CopilotChatResult> {
  const fallback = heuristicSummary(ctx);

  const userPrompt = `Candidate: ${ctx.candidateName}
Role: ${ctx.jobTitle}
Interview: ${ctx.interviewTitle}
Transcript: ${ctx.transcript?.slice(0, 4000) ?? "None"}
Analysis: ${ctx.analysisExplanation ?? "None"}
Scores: confidence ${ctx.confidenceScore}, clarity ${ctx.clarityScore}, consistency ${ctx.consistencyScore}
Risk flags: ${(ctx.riskFlags ?? []).join("; ")}`;

  const llm = await chatJson<{ reply: string; explanation: string }>(
    SYSTEM_PROMPT,
    userPrompt,
    { reply: fallback.reply, explanation: fallback.explanation }
  );

  return {
    intent: "interview_summary",
    reply: llm.reply || fallback.reply,
    citations: [],
    followUpSuggestions: fallback.followUpSuggestions,
    explanation: llm.explanation || fallback.explanation,
  };
}
