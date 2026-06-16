import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { InconsistencyFlag, MismatchAlert } from "../types";

export type InconsistencyContext = {
  transcript: string;
};

const INCONSISTENCY_SYSTEM = `You are Recruitimate's real-time inconsistency detector during a live interview.
Flag contradictions WITHIN the partial transcript so far (timeline conflicts, role ownership shifts, conflicting numbers).
Rules:
- Advisory only. No deception or truthfulness claims.
- Only flag clear contradictions with evidence from the transcript.
- Max 4 flags.
Output valid JSON:
{
  "flags": [
    {
      "label": string,
      "value": string,
      "evidence": string,
      "confidence": "low" | "medium" | "high",
      "severity": "high" | "medium" | "low"
    }
  ],
  "explanation": string
}`;

function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40)
    .replace(/^_|_$/g, "");
  return base ? `${base}_${index}` : `flag_${index}`;
}

function extractYearMentions(text: string): number[] {
  const matches = [...text.matchAll(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b/gi)];
  return matches.map((m) => parseInt(m[1], 10)).filter((n) => n > 0 && n < 50);
}

function heuristicInconsistencyFlags(context: InconsistencyContext): InconsistencyFlag[] {
  const transcript = context.transcript;
  const flags: InconsistencyFlag[] = [];

  const years = extractYearMentions(transcript);
  const uniqueYears = [...new Set(years)];
  if (uniqueYears.length >= 2) {
    const min = Math.min(...uniqueYears);
    const max = Math.max(...uniqueYears);
    if (max - min >= 2) {
      flags.push({
        label: "Experience duration conflict",
        value: `Transcript mentions ${min} and ${max} years — timelines may not align.`,
        evidence: `Found year mentions: ${uniqueYears.join(", ")}`,
        confidence: "medium",
        severity: "high",
      });
    }
  }

  const ledMatch = /\b(i led|i was the lead|i managed|led the)\b/i.test(transcript);
  const assistedMatch = /\b(i helped|helped the|i assisted|assisted with|i supported|the team)\b/i.test(
    transcript
  );
  if (ledMatch && assistedMatch) {
    flags.push({
      label: "Ownership wording shift",
      value: "Candidate alternates between leading and assisting — clarify scope of ownership.",
      evidence: "Both leadership and support phrasing appear in the live transcript.",
      confidence: "medium",
      severity: "medium",
    });
  }

  const neverMatch = transcript.match(
    /\b(never|haven't|have not|no experience)\b[^.]{0,80}\b(with|in|using)\s+([a-z0-9+#.\s]{2,40})/i
  );
  const expertMatch = transcript.match(
    /\b(expert|deep experience|years of experience|built|architected)\b[^.]{0,80}\b(with|in|using)\s+([a-z0-9+#.\s]{2,40})/i
  );
  if (neverMatch && expertMatch) {
    flags.push({
      label: "Skill depth contradiction",
      value: "Transcript contains both inexperience and strong-experience phrasing for technical topics.",
      evidence: "Mixed 'never / no experience' and 'expert / built' statements detected.",
      confidence: "low",
      severity: "high",
    });
  }

  const teamOnly = (transcript.match(/\b(we|the team|our team)\b/gi) ?? []).length;
  const iOnly = (transcript.match(/\b(i|my|me)\b/gi) ?? []).length;
  if (teamOnly > 4 && iOnly <= 1 && transcript.split(/\s+/).length > 60) {
    flags.push({
      label: "Vague ownership pattern",
      value: "Answers rely on 'we/team' with little individual 'I' — probe personal contribution.",
      evidence: `${teamOnly} collective references vs ${iOnly} first-person references.`,
      confidence: "high",
      severity: "medium",
    });
  }

  return flags.slice(0, 4);
}

export async function detectLiveInconsistencies(
  context: InconsistencyContext
): Promise<{ flags: InconsistencyFlag[]; explanation: string }> {
  const fallbackFlags = heuristicInconsistencyFlags(context);
  const fallback = {
    flags: fallbackFlags,
    explanation: hasLlmProvider()
      ? `Heuristic inconsistency scan (${getActiveLlmProviderId()} call failed).`
      : `Heuristic inconsistency scan (no LLM). ${llmSetupHint()}`,
  };

  const userPrompt = `Partial live interview transcript (${context.transcript.length} chars):
${context.transcript.slice(-8000)}`;

  const result = await chatJson<{ flags: InconsistencyFlag[]; explanation: string }>(
    INCONSISTENCY_SYSTEM,
    userPrompt,
    fallback
  );

  const flags = (result.flags ?? [])
    .filter((f) => f.label?.trim() && f.value?.trim())
    .slice(0, 4)
    .map((f) => ({
      label: f.label.trim(),
      value: f.value.trim(),
      evidence: f.evidence?.trim() || "Detected in live transcript.",
      confidence: f.confidence ?? "medium",
      severity: f.severity ?? "medium",
    }));

  return {
    flags: flags.length > 0 ? flags : fallbackFlags,
    explanation: result.explanation?.trim() || fallback.explanation,
  };
}
