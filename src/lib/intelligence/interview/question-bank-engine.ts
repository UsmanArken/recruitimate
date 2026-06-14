import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type {
  InterviewQuestion,
  InterviewQuestionBankResult,
  InterviewQuestionCategory,
  InterviewQuestionDifficulty,
} from "../types";

export type QuestionBankContext = {
  jobTitle: string;
  jobDescription: string;
  jobRequirements?: string | null;
  focus?: InterviewQuestionCategory | "all";
  count?: number;
};

const SYSTEM_PROMPT = `You are Recruitimate's Interview Question Bank generator.
Create role-specific interview questions tailored to the job title, description, and requirements.
Rules:
- Questions must be open-ended and probe real experience (not trivia).
- Mix categories: technical, behavioral, situational, role_fit, culture.
- Include rationale and what each question probes for.
- Difficulty: easy (warm-up), medium (core), hard (depth / staff-level).
- Advisory only — interviewer chooses which to ask.
Output valid JSON:
{
  "questions": [
    {
      "id": "unique_snake_case",
      "question": string,
      "rationale": string,
      "category": "technical" | "behavioral" | "situational" | "role_fit" | "culture",
      "difficulty": "easy" | "medium" | "hard",
      "probesFor": string
    }
  ],
  "roleSummary": string,
  "explanation": string
}`;

const SKILL_KEYWORDS = [
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
  "machine learning",
  "api",
  "sql",
];

const CATEGORIES: InterviewQuestionCategory[] = [
  "technical",
  "behavioral",
  "situational",
  "role_fit",
  "culture",
];

const VALID_DIFFICULTIES = new Set<InterviewQuestionDifficulty>(["easy", "medium", "hard"]);

function slugId(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .slice(0, 40)
    .replace(/^_|_$/g, "");
  return base ? `${base}_${index}` : `question_${index}`;
}

function extractRoleSkills(requirements?: string | null, description?: string): string[] {
  const hay = `${requirements ?? ""} ${description ?? ""}`.toLowerCase();
  const found = SKILL_KEYWORDS.filter((s) => hay.includes(s));
  return found.length ? found : ["core role competencies"];
}

function heuristicQuestionBank(context: QuestionBankContext): InterviewQuestionBankResult {
  const skills = extractRoleSkills(context.jobRequirements, context.jobDescription);
  const title = context.jobTitle;
  const focus = context.focus ?? "all";
  const targetCount = context.count ?? 10;

  const templates: Omit<InterviewQuestion, "id">[] = [
    {
      question: `Walk me through the most complex ${skills[0]} project you've owned for a ${title} role.`,
      rationale: "Opens with a concrete technical ownership story tied to the role stack.",
      category: "technical",
      difficulty: "medium",
      probesFor: skills[0],
    },
    {
      question: `How would you design a system for a core workflow described in this ${title} position?`,
      rationale: "Tests system thinking aligned with job responsibilities.",
      category: "technical",
      difficulty: "hard",
      probesFor: "System design and trade-offs",
    },
    {
      question: `Tell me about a time you disagreed with a teammate on a technical approach. How did you resolve it?`,
      rationale: "Behavioral signal for collaboration under pressure.",
      category: "behavioral",
      difficulty: "medium",
      probesFor: "Collaboration and conflict resolution",
    },
    {
      question: `Describe a situation where you had to deliver under a tight deadline with incomplete requirements.`,
      rationale: "Situational judgment and prioritization.",
      category: "situational",
      difficulty: "medium",
      probesFor: "Prioritization under ambiguity",
    },
    {
      question: `What specifically draws you to this ${title} opportunity versus your current or last role?`,
      rationale: "Validates motivation and role fit.",
      category: "role_fit",
      difficulty: "easy",
      probesFor: "Motivation and career alignment",
    },
    {
      question: `How do you prefer to work with hiring managers and stakeholders in a ${title} team?`,
      rationale: "Culture and communication style fit.",
      category: "culture",
      difficulty: "easy",
      probesFor: "Stakeholder communication",
    },
    {
      question: `What metrics would you use to know your work as a ${title} is successful?`,
      rationale: "Outcome orientation and impact awareness.",
      category: "role_fit",
      difficulty: "medium",
      probesFor: "Impact measurement",
    },
    {
      question: `Tell me about a production incident you helped resolve. What was your role end-to-end?`,
      rationale: "Probes operational maturity and ownership.",
      category: "situational",
      difficulty: "hard",
      probesFor: "Production ownership",
    },
    {
      question: `How do you stay current with changes in ${skills[0]} and apply them on the job?`,
      rationale: "Learning agility for evolving stack.",
      category: "technical",
      difficulty: "easy",
      probesFor: "Continuous learning",
    },
    {
      question: `What kind of team culture helps you do your best work as a ${title}?`,
      rationale: "Culture alignment without leading the answer.",
      category: "culture",
      difficulty: "easy",
      probesFor: "Culture fit",
    },
    {
      question: `Give an example where you improved reliability, latency, or cost for a service you maintained.`,
      rationale: "Depth on engineering excellence beyond feature delivery.",
      category: "technical",
      difficulty: "hard",
      probesFor: "Operational excellence",
    },
    {
      question: `How have you mentored or unblocked others while still delivering your own ${title} work?`,
      rationale: "Seniority signal for collaborative leadership.",
      category: "behavioral",
      difficulty: "medium",
      probesFor: "Mentorship and leverage",
    },
  ];

  const filtered =
    focus === "all" ? templates : templates.filter((t) => t.category === focus);

  const questions = filtered.slice(0, targetCount).map((t, i) => ({
    ...t,
    id: slugId(t.question, i),
  }));

  return {
    questions,
    roleSummary: `Question bank for ${title} emphasizing ${skills.slice(0, 3).join(", ")}.`,
    explanation: hasLlmProvider()
      ? `Heuristic question bank (${getActiveLlmProviderId()} call failed).`
      : `Heuristic question bank (no LLM). ${llmSetupHint()}`,
  };
}

export async function generateInterviewQuestionBank(
  context: QuestionBankContext
): Promise<InterviewQuestionBankResult> {
  const fallback = heuristicQuestionBank(context);
  const count = context.count ?? 10;
  const focus = context.focus ?? "all";

  const userPrompt = `Job title: ${context.jobTitle}
Description:
${context.jobDescription.slice(0, 4000)}

Requirements:
${context.jobRequirements?.slice(0, 2000) ?? "Not specified"}

Generate ${count} questions.
Focus category: ${focus}`;

  const result = await chatJson<InterviewQuestionBankResult>(SYSTEM_PROMPT, userPrompt, fallback);

  const questions = (result.questions ?? [])
    .filter((q) => q.question?.trim())
    .slice(0, count)
    .map((q, i) => ({
      id: q.id?.trim() || slugId(q.question, i),
      question: q.question.trim(),
      rationale: q.rationale?.trim() || "Role-specific probe.",
      category:
        typeof q.category === "string" && CATEGORIES.includes(q.category as InterviewQuestionCategory)
          ? (q.category as InterviewQuestionCategory)
          : "role_fit",
      difficulty: VALID_DIFFICULTIES.has(q.difficulty) ? q.difficulty : "medium",
      probesFor: q.probesFor?.trim() || context.jobTitle,
    }));

  const filtered =
    focus === "all" ? questions : questions.filter((q) => q.category === focus);

  return {
    questions: filtered.length > 0 ? filtered : fallback.questions,
    roleSummary: result.roleSummary?.trim() || fallback.roleSummary,
    explanation: result.explanation?.trim() || fallback.explanation,
  };
}
