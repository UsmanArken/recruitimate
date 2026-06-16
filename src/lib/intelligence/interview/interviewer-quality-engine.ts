import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { InterviewerQualityResult, Signal } from "../types";

export type InterviewerQualityContext = {
  transcript: string;
  jobTitle: string;
  jobRequirements?: string | null;
};

const SYSTEM_PROMPT = `You are Recruitimate's Interview Quality Analyzer.
Evaluate the INTERVIEWER's performance from the transcript — not the candidate.
Score three dimensions (0-1 each):
- coverageScore: how well required role topics were explored
- probingScore: depth of follow-ups and clarifying questions
- biasRiskScore: higher = more potentially biased or leading patterns (advisory, not accusations)

Rules:
- Advisory only. Flag patterns, not intent.
- No deception claims.
- Identify coverage gaps (requirements not explored).
- Note strong/weak probing behavior with evidence.
- Flag bias patterns cautiously (leading questions, irrelevant personal topics, coded language).
Output valid JSON:
{
  "coverageScore": number,
  "probingScore": number,
  "biasRiskScore": number,
  "coverageGaps": [{ "label", "value", "evidence", "confidence": "low"|"medium"|"high" }],
  "probingSignals": [{ "label", "value", "evidence", "confidence" }],
  "biasFlags": [{ "label", "value", "evidence", "confidence" }],
  "explanation": string
}`;

const REQUIREMENT_KEYWORDS = [
  "typescript",
  "javascript",
  "python",
  "react",
  "node",
  "postgres",
  "postgresql",
  "aws",
  "docker",
  "kubernetes",
  "distributed",
  "system design",
  "leadership",
  "api",
  "sql",
  "machine learning",
];

const PROBING_PATTERNS = [
  /\bcan you (elaborate|expand|walk me through)\b/gi,
  /\btell me more\b/gi,
  /\bwhat specifically\b/gi,
  /\bhow did you\b/gi,
  /\bwhy did you choose\b/gi,
  /\bwhat trade-?offs\b/gi,
  /\bwhat was your (role|contribution)\b/gi,
  /\bcan you give (an|a) example\b/gi,
];

const BIAS_PATTERNS: { pattern: RegExp; label: string; value: string }[] = [
  {
    pattern: /\b(where are you from|hometown|native english)\b/gi,
    label: "Potentially irrelevant personal topic",
    value: "Geographic or language-origin question detected — ensure job-relatedness.",
  },
  {
    pattern: /\b(married|children|kids|pregnant|family plans)\b/gi,
    label: "Personal life question",
    value: "Family or marital status topic — high legal/compliance risk if not role-essential.",
  },
  {
    pattern: /\b(young|energetic|digital native|aggressive|ninja|rockstar)\b/gi,
    label: "Coded or leading descriptor",
    value: "Subjective or age-coded language in interviewer prompts.",
  },
  {
    pattern: /\b(culture fit|likeable|would I (have a beer|hang out))\b/gi,
    label: "Vague culture screening",
    value: "Culture-fit framing without structured, job-relevant criteria.",
  },
  {
    pattern: /\byou (should|must|need to) (say|answer|tell)\b/gi,
    label: "Leading prompt",
    value: "Interviewer may be steering the answer rather than exploring.",
  },
];

function extractRequirementTerms(requirements?: string | null): string[] {
  if (!requirements?.trim()) return [];
  const lower = requirements.toLowerCase();
  const fromList = REQUIREMENT_KEYWORDS.filter((k) => lower.includes(k));
  const tokens = lower
    .split(/[^a-z0-9+#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4);
  return [...new Set([...fromList, ...tokens.slice(0, 8)])];
}

function countQuestions(transcript: string): number {
  const explicit = (transcript.match(/\?/g) ?? []).length;
  const openers = (
    transcript.match(/^\s*(what|why|how|when|tell me|can you|could you|describe)\b/gim) ?? []
  ).length;
  return explicit + openers;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function heuristicQuality(context: InterviewerQualityContext): InterviewerQualityResult {
  const transcript = context.transcript;
  const lower = transcript.toLowerCase();
  const terms = extractRequirementTerms(context.jobRequirements);
  const words = transcript.split(/\s+/).length;

  const covered = terms.filter((t) => lower.includes(t));
  const missing = terms.filter((t) => !lower.includes(t));
  const coverageScore =
    terms.length > 0 ? clamp01(covered.length / terms.length) : words > 200 ? 0.55 : 0.35;

  let probingHits = 0;
  for (const pattern of PROBING_PATTERNS) {
    probingHits += (transcript.match(pattern) ?? []).length;
  }
  const questionCount = countQuestions(transcript);
  const probingScore = clamp01(
    (probingHits * 0.12 + questionCount * 0.04) / Math.max(words / 200, 1)
  );

  const biasFlags: Signal[] = [];
  for (const entry of BIAS_PATTERNS) {
    if (entry.pattern.test(transcript)) {
      biasFlags.push({
        label: entry.label,
        value: entry.value,
        evidence: "Pattern matched in transcript text.",
        confidence: "low",
      });
      entry.pattern.lastIndex = 0;
    }
  }
  const biasRiskScore = clamp01(biasFlags.length * 0.22 + (questionCount < 3 && words > 150 ? 0.15 : 0));

  const coverageGaps: Signal[] = missing.slice(0, 4).map((term) => ({
    label: `Requirement not explored: ${term}`,
    value: `Role requirements mention ${term} but it was not substantively covered.`,
    evidence: `Keyword "${term}" absent from transcript.`,
    confidence: "medium" as const,
  }));

  if (terms.length === 0) {
    coverageGaps.push({
      label: "No structured requirements",
      value: "Job has no requirements text — coverage scored from transcript depth only.",
      evidence: "Add requirements on the job to improve coverage scoring.",
      confidence: "high",
    });
  }

  const probingSignals: Signal[] = [];
  if (probingHits >= 2) {
    probingSignals.push({
      label: "Follow-up depth",
      value: `${probingHits} probing follow-up patterns detected`,
      evidence: "Elaboration and specificity prompts found in transcript.",
      confidence: "medium",
    });
  } else if (words > 120) {
    probingSignals.push({
      label: "Limited follow-up depth",
      value: "Few clarifying or deepening prompts detected",
      evidence: `Only ${probingHits} probing patterns for ${words} words.`,
      confidence: "medium",
    });
  }

  if (questionCount >= 5) {
    probingSignals.push({
      label: "Question volume",
      value: `${questionCount} interviewer questions detected`,
      evidence: "Question marks and open-ended prompts counted in transcript.",
      confidence: "high",
    });
  }

  return {
    coverageScore,
    probingScore,
    biasRiskScore,
    coverageGaps,
    probingSignals,
    biasFlags,
    explanation: hasLlmProvider()
      ? `Heuristic interviewer quality (${getActiveLlmProviderId()} call failed).`
      : `Heuristic interviewer quality (no LLM). ${llmSetupHint()}`,
  };
}

function normalizeSignals(signals: Signal[] | undefined, max: number): Signal[] {
  return (signals ?? [])
    .filter((s) => s.label?.trim() && s.value?.trim())
    .slice(0, max)
    .map((s) => ({
      label: s.label.trim(),
      value: s.value.trim(),
      evidence: s.evidence?.trim() || "Derived from transcript analysis.",
      confidence: s.confidence ?? "medium",
    }));
}

export async function analyzeInterviewerQuality(
  context: InterviewerQualityContext
): Promise<InterviewerQualityResult> {
  const fallback = heuristicQuality(context);

  const userPrompt = `Role: ${context.jobTitle}
Requirements:
${context.jobRequirements?.slice(0, 2000) ?? "Not specified"}

Interview transcript (${context.transcript.length} chars):
${context.transcript.slice(0, 16000)}

Analyze interviewer question coverage, probing depth, and advisory bias patterns.`;

  const result = await chatJson<InterviewerQualityResult>(SYSTEM_PROMPT, userPrompt, fallback);

  return {
    coverageScore: clamp01(result.coverageScore ?? fallback.coverageScore),
    probingScore: clamp01(result.probingScore ?? fallback.probingScore),
    biasRiskScore: clamp01(result.biasRiskScore ?? fallback.biasRiskScore),
    coverageGaps: normalizeSignals(result.coverageGaps, 5),
    probingSignals: normalizeSignals(result.probingSignals, 4),
    biasFlags: normalizeSignals(result.biasFlags, 4),
    explanation: result.explanation?.trim() || fallback.explanation,
  };
}
