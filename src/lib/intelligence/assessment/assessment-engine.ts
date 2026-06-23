import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type {
  AssessmentDifficulty,
  AssessmentRubricCriterion,
  AssessmentTaskItem,
  AssessmentTaskKind,
  AssessmentTaskSetResult,
} from "../types";
import { extractSkillsFromText } from "../talent/skill-keywords";

export type AssessmentGenerationContext = {
  jobTitle: string;
  jobDescription: string;
  jobRequirements?: string | null;
  focus?: AssessmentTaskKind | "all";
  count?: number;
};

const SYSTEM_PROMPT = `You are Recruitimate's Assessment Engine.
Generate real-world hiring tasks (not trivia) tailored to the role.
Task types: code (engineering), product (PM/design), ops (reliability/process), scenario (cross-functional).
Each task needs a clear prompt, deliverables, rubric criteria with weights, and skills tested.
Output valid JSON:
{
  "tasks": [
    {
      "id": "snake_case_id",
      "title": string,
      "prompt": string,
      "taskType": "code" | "product" | "ops" | "scenario",
      "difficulty": "easy" | "medium" | "hard",
      "rubric": [{ "id": string, "label": string, "weight": number, "description": string }],
      "skillsTested": string[],
      "deliverables": string[],
      "estimatedMinutes": number
    }
  ],
  "roleSummary": string,
  "explanation": string
}`;

const TASK_TEMPLATES: Record<
  AssessmentTaskKind,
  { title: string; prompt: string; deliverables: string[] }
> = {
  code: {
    title: "API reliability improvement",
    prompt:
      "Design and outline a solution to make a candidate-facing API more reliable under load. Include data model changes, caching strategy, and how you would roll out safely.",
    deliverables: ["Written design (500–800 words)", "Sequence diagram or pseudo-code for critical path"],
  },
  product: {
    title: "Feature prioritization exercise",
    prompt:
      "You are PM for a hiring platform. Three stakeholder requests conflict: faster resume parsing, interview scheduling UX, and admin reporting. Prioritize for the next sprint and explain trade-offs.",
    deliverables: ["Prioritized backlog with rationale", "Success metrics for top priority"],
  },
  ops: {
    title: "Incident response playbook",
    prompt:
      "A production deploy caused elevated 5xx errors on interview upload. Draft your first-hour incident response: triage steps, comms, and rollback criteria.",
    deliverables: ["Incident timeline", "Root-cause hypotheses", "Post-incident action items"],
  },
  scenario: {
    title: "Cross-team rollout",
    prompt:
      "Roll out a new AI screening feature to 20% of recruiters while keeping audit logs for compliance. Describe your rollout plan and risk mitigations.",
    deliverables: ["Rollout phases", "Risk register", "Rollback triggers"],
  },
};

function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 36)
    .replace(/^_|_$/g, "");
  return base ? `${base}_${index}` : `task_${index}`;
}

function defaultRubric(taskType: AssessmentTaskKind): AssessmentRubricCriterion[] {
  const common = [
    { id: "clarity", label: "Clarity", weight: 0.25, description: "Clear structure and communication" },
    { id: "depth", label: "Depth", weight: 0.35, description: "Demonstrates real-world judgment" },
    { id: "tradeoffs", label: "Trade-offs", weight: 0.25, description: "Acknowledges constraints and risks" },
    { id: "execution", label: "Execution plan", weight: 0.15, description: "Actionable next steps" },
  ];
  if (taskType === "code") {
    return [
      { id: "architecture", label: "Architecture", weight: 0.35, description: "Sound system design choices" },
      { id: "reliability", label: "Reliability", weight: 0.3, description: "Failure modes and observability" },
      { id: "pragmatism", label: "Pragmatism", weight: 0.2, description: "Appropriate scope for timeline" },
      { id: "communication", label: "Communication", weight: 0.15, description: "Readable explanation" },
    ];
  }
  return common;
}

function heuristicTasks(ctx: AssessmentGenerationContext): AssessmentTaskSetResult {
  const skills = extractSkillsFromText(`${ctx.jobRequirements ?? ""} ${ctx.jobDescription}`);
  const kinds: AssessmentTaskKind[] =
    ctx.focus && ctx.focus !== "all"
      ? [ctx.focus]
      : (["code", "product", "scenario"] as AssessmentTaskKind[]);

  const count = Math.min(ctx.count ?? 3, kinds.length);
  const tasks: AssessmentTaskItem[] = [];

  for (let i = 0; i < count; i++) {
    const taskType = kinds[i % kinds.length];
    const template = TASK_TEMPLATES[taskType];
    const title = `${ctx.jobTitle}: ${template.title}`;
    tasks.push({
      id: slugId(title, i),
      title,
      prompt: `${template.prompt}\n\nRole context: ${ctx.jobTitle}. Requirements: ${ctx.jobRequirements ?? "See job description"}.`,
      taskType,
      difficulty: i === 0 ? "medium" : "hard",
      rubric: defaultRubric(taskType),
      skillsTested: skills.length ? skills.slice(0, 5) : ["problem solving", "communication"],
      deliverables: template.deliverables,
      estimatedMinutes: taskType === "code" ? 90 : 60,
    });
  }

  return {
    tasks,
    roleSummary: `Real-world ${ctx.jobTitle} assessment tasks emphasizing ${skills.slice(0, 3).join(", ") || "role fit"}.`,
    explanation: heuristicExplanation(),
  };
}

function heuristicExplanation(): string {
  if (!hasLlmProvider()) {
    return `Heuristic task set (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Heuristic task set (${provider} call failed — using templates).`;
}

export async function generateAssessmentTasks(
  ctx: AssessmentGenerationContext
): Promise<AssessmentTaskSetResult> {
  const fallback = heuristicTasks(ctx);

  const userPrompt = `Job: ${ctx.jobTitle}
Description: ${ctx.jobDescription.slice(0, 1500)}
Requirements: ${ctx.jobRequirements ?? "Not specified"}
Focus: ${ctx.focus ?? "all"}
Count: ${ctx.count ?? 3}`;

  const llm = await chatJson<AssessmentTaskSetResult>(SYSTEM_PROMPT, userPrompt, fallback);

  const tasks = (llm.tasks ?? fallback.tasks).map((t, i) => ({
    ...t,
    id: t.id || slugId(t.title, i),
    difficulty: (["easy", "medium", "hard"].includes(t.difficulty)
      ? t.difficulty
      : "medium") as AssessmentDifficulty,
    rubric: t.rubric?.length ? t.rubric : defaultRubric(t.taskType),
    estimatedMinutes: t.estimatedMinutes ?? 60,
    deliverables: t.deliverables?.length ? t.deliverables : ["Written response"],
  }));

  return {
    tasks,
    roleSummary: llm.roleSummary || fallback.roleSummary,
    explanation: llm.explanation || fallback.explanation,
  };
}
