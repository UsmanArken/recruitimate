import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type {
  AssessmentEvaluationResult,
  AssessmentRubricCriterion,
  AssessmentTaskItem,
} from "../types";

export type EvaluationContext = {
  task: Pick<AssessmentTaskItem, "title" | "prompt" | "taskType" | "rubric" | "skillsTested">;
  responseText: string;
  candidateName?: string;
};

const SYSTEM_PROMPT = `You are Recruitimate's Assessment Evaluation Engine.
Score a candidate's written task submission against the rubric. Be evidence-based — cite phrases from the response.
Never invent content not in the submission. Output valid JSON:
{
  "overallScore": number (0-1),
  "criterionScores": [{ "criterionId": string, "label": string, "score": number (0-1), "feedback": string }],
  "strengths": string[],
  "gaps": string[],
  "signals": [{ "label": string, "value": string, "evidence": string, "confidence": "low"|"medium"|"high" }],
  "explanation": string
}`;

function scoreKeywordCoverage(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  if (!keywords.length) return 0.5;
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return Math.min(0.95, 0.35 + hits.length / keywords.length * 0.5);
}

function heuristicEvaluation(ctx: EvaluationContext): AssessmentEvaluationResult {
  const response = ctx.responseText.trim();
  const lengthScore = Math.min(1, response.length / 800);
  const keywordScore = scoreKeywordCoverage(
    response,
    [...ctx.task.skillsTested, "trade-off", "risk", "plan", "metric"]
  );

  const criterionScores = ctx.task.rubric.map((c: AssessmentRubricCriterion) => {
    const base = lengthScore * 0.4 + keywordScore * 0.6;
    const score = Math.min(0.92, Math.max(0.25, base));
    return {
      criterionId: c.id,
      label: c.label,
      score,
      feedback: `Heuristic review — ${c.description}. Response length and keyword coverage considered.`,
    };
  });

  const overallScore =
    criterionScores.reduce((sum, c) => {
      const weight =
        ctx.task.rubric.find((r) => r.id === c.criterionId)?.weight ?? 1 / criterionScores.length;
      return sum + c.score * weight;
    }, 0) / criterionScores.reduce((sum, c) => {
      const weight =
        ctx.task.rubric.find((r) => r.id === c.criterionId)?.weight ?? 1 / criterionScores.length;
      return sum + weight;
    }, 0);

  const strengths =
    overallScore >= 0.6
      ? ["Structured response with relevant role signals"]
      : ["Submission received — review manually for depth"];
  const gaps =
    overallScore < 0.65
      ? ["Verify depth on rubric criteria in follow-up interview"]
      : [];

  return {
    overallScore,
    criterionScores,
    strengths,
    gaps,
    signals: [
      {
        label: "Submission quality",
        value: overallScore >= 0.7 ? "Strong" : overallScore >= 0.5 ? "Adequate" : "Needs review",
        evidence: `${response.length} characters submitted for ${ctx.task.title}`,
        confidence: response.length > 200 ? "medium" : "low",
      },
    ],
    explanation: heuristicExplanation(),
  };
}

function heuristicExplanation(): string {
  if (!hasLlmProvider()) {
    return `Heuristic scoring (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Heuristic scoring (${provider} call failed — using rubric templates).`;
}

export async function evaluateAssessmentSubmission(
  ctx: EvaluationContext
): Promise<AssessmentEvaluationResult> {
  const fallback = heuristicEvaluation(ctx);

  const userPrompt = `Task: ${ctx.task.title} (${ctx.task.taskType})
Prompt: ${ctx.task.prompt.slice(0, 1200)}
Rubric: ${JSON.stringify(ctx.task.rubric)}
Candidate: ${ctx.candidateName ?? "Candidate"}

Submission:
${ctx.responseText.slice(0, 6000)}`;

  const result = await chatJson<AssessmentEvaluationResult>(SYSTEM_PROMPT, userPrompt, fallback);

  return {
    ...result,
    overallScore: Math.min(1, Math.max(0, result.overallScore ?? fallback.overallScore)),
    criterionScores: result.criterionScores?.length
      ? result.criterionScores
      : fallback.criterionScores,
    strengths: result.strengths?.length ? result.strengths : fallback.strengths,
    gaps: result.gaps?.length ? result.gaps : fallback.gaps,
    signals: result.signals?.length ? result.signals : fallback.signals,
    explanation: result.explanation || fallback.explanation,
  };
}
