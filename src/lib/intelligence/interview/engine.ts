import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { InterviewIntelligenceResult } from "../types";

const SYSTEM_PROMPT = `You are Recruitimate's Interview Intelligence Engine (post-interview analysis).
Analyze interview transcripts for signals — NOT judgments. Show hesitation, confidence, clarity, consistency, engagement.
Avoid claiming "truthfulness" or deception. Use cautious language. Output valid JSON:
{
  "hesitationScore": number (0-1, higher = more hesitation),
  "confidenceScore": number (0-1),
  "clarityScore": number (0-1),
  "consistencyScore": number (0-1),
  "engagementScore": number (0-1),
  "cognitiveSignals": [{ "label", "value", "evidence", "confidence": "low"|"medium"|"high" }],
  "behavioralMetrics": [{ "label", "value", "evidence", "confidence" }],
  "riskFlags": [{ "label", "value", "evidence", "confidence" }],
  "explanation": string
}`;

function heuristicAnalysis(transcript: string): InterviewIntelligenceResult {
  const words = transcript.split(/\s+/).length;
  const fillers = (transcript.match(/\b(um|uh|like|you know)\b/gi) ?? []).length;
  const hesitationScore = Math.min(1, fillers / Math.max(words / 50, 1));

  return {
    hesitationScore,
    confidenceScore: 0.65,
    clarityScore: words > 200 ? 0.7 : 0.5,
    consistencyScore: 0.6,
    engagementScore: 0.68,
    cognitiveSignals: [
      {
        label: "Response pacing",
        value: fillers > 5 ? "Frequent filler words" : "Relatively fluent pacing",
        evidence: `Detected ${fillers} filler occurrences in ${words} words`,
        confidence: "medium",
      },
    ],
    behavioralMetrics: [
      {
        label: "Transcript depth",
        value: words > 300 ? "Substantive responses" : "Short or sparse responses",
        evidence: `${words} words in transcript`,
        confidence: "high",
      },
    ],
    riskFlags:
      hesitationScore > 0.6
        ? [
            {
              label: "Clarity follow-up",
              value: "High hesitation markers — probe specifics in next round",
              evidence: "Elevated filler word density",
              confidence: "low",
            },
          ]
        : [],
    explanation:
      hasLlmProvider()
        ? `Heuristic post-interview analysis (${getActiveLlmProviderId()} call failed — check terminal for llm_error).`
        : `Heuristic post-interview analysis (no LLM configured). ${llmSetupHint()}`,
  };
}

export async function analyzeInterview(
  transcript: string,
  resumeContext?: string | null
): Promise<InterviewIntelligenceResult> {
  const fallback = heuristicAnalysis(transcript);

  const userPrompt = `Resume context (for consistency hints only, do not accuse deception):
${resumeContext?.slice(0, 4000) ?? "Not provided"}

Transcript:
${transcript.slice(0, 16000)}`;

  return chatJson<InterviewIntelligenceResult>(SYSTEM_PROMPT, userPrompt, fallback);
}
