import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { MismatchAlert, MismatchType } from "../types";

export type CrossSignalContext = {
  transcript: string;
  resumeText: string;
  candidateName: string;
  jobTitle: string;
  skills?: string[];
  talentGaps?: string[];
  talentStrengths?: string[];
  experienceYears?: number | null;
};

const CROSS_SIGNAL_SYSTEM = `You are Recruitimate's Cross-Signal Validation engine (live interview).
Compare resume/profile claims against what the candidate has said SO FAR in the partial live transcript.
Rules:
- Advisory only — surface gaps and possible mismatches, not accusations.
- No deception or truthfulness claims.
- Each alert must cite resume claim AND interview statement with evidence.
- Types: contradiction | unsupported_claim | experience_gap | skill_gap | timeline
- Max 5 alerts.
Output valid JSON:
{
  "alerts": [
    {
      "id": "unique-id",
      "label": string,
      "resumeClaim": string,
      "interviewStatement": string,
      "evidence": string,
      "confidence": "low" | "medium" | "high",
      "severity": "high" | "medium" | "low",
      "type": "contradiction" | "unsupported_claim" | "experience_gap" | "skill_gap" | "timeline"
    }
  ],
  "summary": string,
  "explanation": string
}`;

function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40)
    .replace(/^_|_$/g, "");
  return base ? `${base}_${index}` : `mismatch_${index}`;
}

function extractResumeYears(resumeText: string): number | null {
  const match = resumeText.match(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b/i);
  return match ? parseInt(match[1], 10) : null;
}

function extractTranscriptYears(transcript: string): number[] {
  return [...transcript.matchAll(/\b(\d{1,2})\+?\s*(?:years?|yrs?)\b/gi)]
    .map((m) => parseInt(m[1], 10))
    .filter((n) => n > 0 && n < 50);
}

function skillMentioned(skill: string, text: string): boolean {
  const normalized = skill.toLowerCase().replace(/[^a-z0-9+#]/g, "");
  if (!normalized) return false;
  const hay = text.toLowerCase().replace(/[^a-z0-9+#\s]/g, " ");
  return hay.includes(normalized) || hay.includes(normalized.replace(/\+/g, " "));
}

function heuristicCrossSignal(context: CrossSignalContext): {
  alerts: MismatchAlert[];
  summary: string;
  explanation: string;
} {
  const alerts: MismatchAlert[] = [];
  const transcript = context.transcript.trim();
  const resumeYears =
    context.experienceYears ?? extractResumeYears(context.resumeText);
  const transcriptYears = extractTranscriptYears(transcript);

  if (resumeYears != null && transcriptYears.length > 0) {
    const minT = Math.min(...transcriptYears);
    const maxT = Math.max(...transcriptYears);
    if (resumeYears - maxT >= 3 || minT - resumeYears >= 2) {
      alerts.push({
        id: "experience_gap",
        label: "Experience years mismatch",
        resumeClaim: `Resume indicates ~${resumeYears} years experience`,
        interviewStatement: `Live transcript mentions ${transcriptYears.join(", ")} years`,
        evidence: "Resume experience duration differs from spoken timeline.",
        confidence: "medium",
        severity: "high",
        type: "experience_gap",
      });
    }
  }

  const skills = context.skills ?? [];
  const wordCount = transcript.split(/\s+/).length;
  if (wordCount >= 50 && skills.length > 0) {
    const missing = skills.filter((s) => !skillMentioned(s, transcript)).slice(0, 2);
    for (const skill of missing) {
      alerts.push({
        id: slugId(skill, alerts.length),
        label: `Resume skill not discussed: ${skill}`,
        resumeClaim: `Resume lists ${skill} as a core skill`,
        interviewStatement: `${skill} not referenced in the live transcript so far`,
        evidence: "Cross-signal gap — resume highlights skill not yet explored live.",
        confidence: "medium",
        severity: "medium",
        type: "skill_gap",
      });
    }
  }

  for (const gap of (context.talentGaps ?? []).slice(0, 1)) {
    alerts.push({
      id: slugId(gap, alerts.length),
      label: "Talent screening gap still open",
      resumeClaim: `Pre-interview screening flagged: ${gap}`,
      interviewStatement: "Topic not substantively addressed in live answers yet",
      evidence: "Resume/talent layer gap remains unexplored in conversation.",
      confidence: "high",
      severity: "high",
      type: "unsupported_claim",
    });
  }

  const denialPattern =
    /\b(never|haven't|have not|don't know|not familiar|no experience)\b/i;
  const strength = (context.talentStrengths ?? [])[0];
  if (strength && denialPattern.test(transcript) && skillMentioned(strength, context.resumeText)) {
    const strengthInDenial = new RegExp(
      `(never|haven't|not familiar|no experience)[^.]{0,60}${strength.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "i"
    );
    if (strengthInDenial.test(transcript)) {
      alerts.push({
        id: "strength_denial",
        label: "Resume strength contradicted live",
        resumeClaim: `Resume highlights strength in ${strength}`,
        interviewStatement: `Candidate expressed inexperience or unfamiliarity with ${strength}`,
        evidence: "Live denial conflicts with resume-highlighted strength.",
        confidence: "low",
        severity: "high",
        type: "contradiction",
      });
    }
  }

  const summary =
    alerts.length > 0
      ? `${alerts.length} resume vs interview signal(s) need follow-up.`
      : "No major resume vs interview mismatches detected yet — keep validating specifics.";

  return {
    alerts: alerts.slice(0, 5),
    summary,
    explanation: hasLlmProvider()
      ? `Heuristic cross-signal validation (${getActiveLlmProviderId()} call failed).`
      : `Heuristic cross-signal validation (no LLM). ${llmSetupHint()}`,
  };
}

const VALID_TYPES: MismatchType[] = [
  "contradiction",
  "unsupported_claim",
  "experience_gap",
  "skill_gap",
  "timeline",
];

export async function validateCrossSignals(
  context: CrossSignalContext
): Promise<{ alerts: MismatchAlert[]; summary: string; explanation: string }> {
  const fallback = heuristicCrossSignal(context);

  const userPrompt = `Candidate: ${context.candidateName}
Role: ${context.jobTitle}
Resume experience years: ${context.experienceYears ?? "unknown"}
Resume skills: ${(context.skills ?? []).join(", ") || "none"}
Talent gaps: ${(context.talentGaps ?? []).join("; ") || "none"}
Talent strengths: ${(context.talentStrengths ?? []).join("; ") || "none"}

Resume text:
${context.resumeText.slice(0, 6000)}

Partial live transcript (${context.transcript.length} chars):
${context.transcript.slice(-8000)}`;

  const result = await chatJson<{
    alerts: MismatchAlert[];
    summary: string;
    explanation: string;
  }>(CROSS_SIGNAL_SYSTEM, userPrompt, fallback);

  const alerts = (result.alerts ?? [])
    .filter((a) => a.resumeClaim?.trim() && a.interviewStatement?.trim())
    .slice(0, 5)
    .map((a, i) => ({
      id: a.id?.trim() || slugId(a.label, i),
      label: a.label?.trim() || "Resume vs interview mismatch",
      resumeClaim: a.resumeClaim.trim(),
      interviewStatement: a.interviewStatement.trim(),
      evidence: a.evidence?.trim() || "Cross-signal comparison of resume and live transcript.",
      confidence: a.confidence ?? "medium",
      severity: a.severity ?? "medium",
      type: VALID_TYPES.includes(a.type) ? a.type : "unsupported_claim",
    }));

  return {
    alerts: alerts.length > 0 ? alerts : fallback.alerts,
    summary: result.summary?.trim() || fallback.summary,
    explanation: result.explanation?.trim() || fallback.explanation,
  };
}
