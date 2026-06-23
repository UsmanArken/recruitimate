import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import { validateCrossSignals } from "./cross-signal-engine";
import { detectLiveInconsistencies } from "./inconsistency-engine";
import type { LiveAssistResult, LiveAssistSuggestion } from "../types";

export type LiveAssistContext = {
  transcript: string;
  candidateName: string;
  jobTitle: string;
  jobRequirements?: string | null;
  resumeText?: string;
  skills?: string[];
  experienceYears?: number | null;
  talentGaps?: string[];
  talentStrengths?: string[];
};

const SYSTEM_PROMPT = `You are Recruitimate's Live Interview Assist (real-time, during an active interview).
Suggest 3-5 follow-up questions the interviewer can ask RIGHT NOW based on the partial transcript so far.
Rules:
- Advisory only — assist, do not replace human judgment.
- No deception or "truthfulness" claims.
- Prioritize vague answers, unexplored resume gaps, and shallow technical claims.
- Questions must be conversational and specific to what was just said.
Output valid JSON:
{
  "suggestions": [
    {
      "id": "unique-snake-case-id",
      "question": string,
      "rationale": string,
      "category": "probe" | "clarify" | "deepen",
      "priority": "high" | "medium" | "low"
    }
  ],
  "momentSummary": string,
  "explanation": string
}`;

function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40)
    .replace(/^_|_$/g, "");
  return base ? `${base}_${index}` : `suggestion_${index}`;
}

function detectVaguePhrases(transcript: string): string[] {
  const patterns = [
    /\b(we|the team|everyone)\b/gi,
    /\b(helped|involved|worked on)\b/gi,
    /\b(things|stuff|various|several)\b/gi,
    /\b(um|uh|like|you know)\b/gi,
  ];
  const hits: string[] = [];
  for (const pattern of patterns) {
    if (pattern.test(transcript)) {
      hits.push(pattern.source.replace(/\\b/g, "").replace(/\\/g, ""));
    }
  }
  return hits;
}

function heuristicLiveAssist(context: LiveAssistContext): LiveAssistResult {
  const transcript = context.transcript.trim();
  const vague = detectVaguePhrases(transcript);
  const gaps = context.talentGaps ?? [];
  const suggestions: LiveAssistSuggestion[] = [];

  if (vague.length > 0) {
    suggestions.push({
      id: "clarify_ownership",
      question: `What was your personal contribution versus the team's on the work you just described?`,
      rationale: "The transcript uses collective or vague phrasing — probe individual ownership.",
      category: "clarify",
      priority: "high",
    });
  }

  for (const gap of gaps.slice(0, 2)) {
    suggestions.push({
      id: slugId(gap, suggestions.length),
      question: `You mentioned experience elsewhere — can you walk me through a concrete example involving ${gap}?`,
      rationale: `Resume gap flagged for ${context.jobTitle}: ${gap}`,
      category: "probe",
      priority: "high",
    });
  }

  const wordCount = transcript.split(/\s+/).length;
  if (wordCount < 120) {
    suggestions.push({
      id: "deepen_recent_topic",
      question: `Can you go deeper on the most recent topic — what trade-offs did you consider and what would you do differently?`,
      rationale: "Early-stage interview — encourage substantive depth before moving on.",
      category: "deepen",
      priority: "medium",
    });
  } else {
    suggestions.push({
      id: "validate_specifics",
      question: `What metrics or outcomes can you share for the project you described (latency, scale, timeline)?`,
      rationale: "Longer answers benefit from measurable specifics.",
      category: "deepen",
      priority: "medium",
    });
  }

  if (context.talentStrengths?.length) {
    suggestions.push({
      id: "leverage_strength",
      question: `How would you apply your strength in ${context.talentStrengths[0]} to the challenges of this ${context.jobTitle} role?`,
      rationale: "Connect confirmed resume strength to the open role.",
      category: "probe",
      priority: "low",
    });
  }

  const unique = suggestions.slice(0, 5);
  const momentSummary =
    vague.length > 0
      ? "Candidate answers sound high-level so far — consider probing ownership and specifics."
      : gaps.length > 0
        ? `Talent screening flagged ${gaps.length} gap(s) worth exploring live.`
        : "Conversation is progressing — deepen with metrics and trade-off questions.";

  return {
    suggestions: unique,
    momentSummary,
    explanation: hasLlmProvider()
      ? `Heuristic live assist (${getActiveLlmProviderId()} call failed — check terminal for llm_error).`
      : `Heuristic live assist (no LLM configured). ${llmSetupHint()}`,
    mismatchAlerts: [],
    inconsistencyFlags: [],
    crossSignalSummary: "",
  };
}

export async function generateLiveAssistSuggestions(
  context: LiveAssistContext
): Promise<LiveAssistResult> {
  const fallback = heuristicLiveAssist(context);

  const gaps = (context.talentGaps ?? []).join("; ") || "None flagged";
  const strengths = (context.talentStrengths ?? []).join("; ") || "None flagged";

  const userPrompt = `Role: ${context.jobTitle}
Requirements: ${context.jobRequirements?.slice(0, 2000) ?? "Not specified"}
Candidate: ${context.candidateName}
Resume gaps to probe: ${gaps}
Resume strengths: ${strengths}

Partial live transcript (${context.transcript.length} chars):
${context.transcript.slice(-8000)}`;

  const [suggestResult, crossSignal, inconsistencies] = await Promise.all([
    chatJson<Pick<LiveAssistResult, "suggestions" | "momentSummary" | "explanation">>(
      SYSTEM_PROMPT,
      userPrompt,
      fallback
    ),
    validateCrossSignals({
      transcript: context.transcript,
      resumeText: context.resumeText ?? "",
      candidateName: context.candidateName,
      jobTitle: context.jobTitle,
      skills: context.skills,
      talentGaps: context.talentGaps,
      talentStrengths: context.talentStrengths,
      experienceYears: context.experienceYears,
    }),
    detectLiveInconsistencies({ transcript: context.transcript }),
  ]);

  const suggestions = (suggestResult.suggestions ?? [])
    .filter((s) => s.question?.trim())
    .slice(0, 5)
    .map((s, i) => ({
      id: s.id?.trim() || slugId(s.question, i),
      question: s.question.trim(),
      rationale: s.rationale?.trim() || "Suggested based on conversation so far.",
      category: s.category ?? "probe",
      priority: s.priority ?? "medium",
    }));

  const explanations = [
    suggestResult.explanation?.trim() || fallback.explanation,
    crossSignal.explanation,
    inconsistencies.explanation,
  ].filter(Boolean);

  return {
    suggestions,
    momentSummary: suggestResult.momentSummary?.trim() || fallback.momentSummary,
    explanation: explanations.join(" "),
    mismatchAlerts: crossSignal.alerts,
    inconsistencyFlags: inconsistencies.flags,
    crossSignalSummary: crossSignal.summary,
  };
}
