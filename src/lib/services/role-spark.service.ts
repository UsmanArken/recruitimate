import { chatJson } from "@/lib/intelligence/ai";
import { normalizeJobDraft } from "@/lib/jobs/normalize-job-draft";
import type { RoleSparkDraft, RoleSparkInput } from "@/lib/validators/role-spark";

const SENIORITY_LABEL: Record<NonNullable<RoleSparkInput["seniority"]>, string> = {
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead / Staff",
  DIRECTOR: "Director",
};

const WORK_MODEL_LABEL: Record<NonNullable<RoleSparkInput["workModel"]>, string> = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

function buildFallback(input: RoleSparkInput): RoleSparkDraft {
  const seniority = input.seniority ? SENIORITY_LABEL[input.seniority] : null;
  const work = input.workModel ? WORK_MODEL_LABEL[input.workModel] : null;
  const location = input.location?.trim();
  const headline = [seniority, input.title].filter(Boolean).join(" ");

  const signals = [
    input.keywords.trim(),
    work,
    location ? `Location: ${location}` : null,
    input.teamContext?.trim(),
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    description: `${headline} — ${signals}. Own the end-to-end delivery of this role with clear impact on product and team outcomes.`,
    requirements: `Must-have signals from your brief:\n${input.keywords
      .split(/[,;]+/)
      .map((k) => k.trim())
      .filter(Boolean)
      .map((k) => `· ${k}`)
      .join("\n")}\n\nAdd years of experience and non-negotiables in the editor.`,
    jobPostDocument: `We're hiring a ${headline}${location ? ` in ${location}` : ""}${work ? ` (${work})` : ""}.\n\nYou'll work on challenges shaped by: ${input.keywords}.\n\n${
      input.teamContext?.trim() ?? "Join a collaborative team building meaningful product impact."
    }\n\nApply with your resume — we review every profile.`,
  };
}

export async function generateRoleSparkDraft(input: RoleSparkInput): Promise<RoleSparkDraft> {
  const fallback = buildFallback(input);

  const seniority = input.seniority ? SENIORITY_LABEL[input.seniority] : "Not specified";
  const work = input.workModel ? WORK_MODEL_LABEL[input.workModel] : "Not specified";

  const prompt = `Recruiter brief — generate a complete job requisition draft.

Role title: ${input.title}
Seniority: ${seniority}
Keywords / must-have signals: ${input.keywords}
Work model: ${work}
Location: ${input.location?.trim() || "Not specified"}
Team context: ${input.teamContext?.trim() || "Not specified"}

Output JSON only:
{
  "description": "2-4 sentence internal summary for recruiters",
  "requirements": "bullet-style must-haves for AI resume fit scoring (skills, years, tools)",
  "jobPostDocument": "engaging public job post candidates would read on a careers page"
}

Tone: professional, inclusive, specific to the keywords. No placeholder brackets.`;

  const raw = await chatJson<RoleSparkDraft>(
    "You are an expert recruiting copywriter. Output valid JSON only.",
    prompt,
    fallback
  );

  return normalizeJobDraft(raw);
}
