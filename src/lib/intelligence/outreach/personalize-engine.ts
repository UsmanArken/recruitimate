import { chatJson, getActiveLlmProviderId, hasLlmProvider, llmSetupHint } from "../ai";
import type { OutreachPersonalizeResult } from "../types";
import { renderOutreachTemplate } from "./template-engine";
import type { OutreachTemplateVariables } from "../types";

export type PersonalizeContext = {
  candidateName: string;
  candidateEmail?: string | null;
  candidateProfile?: string | null;
  jobTitle?: string | null;
  jobDescription?: string | null;
  jobRequirements?: string | null;
  recruiterName?: string | null;
  companyName?: string | null;
  templateSubject: string;
  templateBody: string;
  tone?: "professional" | "warm" | "direct";
};

const SYSTEM_PROMPT = `You are Recruitimate's outreach personalization engine.
Write a tailored recruiting email based on the candidate profile and role context.
Rules:
- Keep it concise (under 180 words).
- Reference specific skills or experience from the profile when available.
- Do not invent credentials not supported by the profile.
- Advisory only — recruiter reviews before sending.
Output valid JSON:
{
  "subject": string,
  "bodyText": string,
  "tone": string,
  "highlights": string[],
  "explanation": string
}`;

function heuristicPersonalize(ctx: PersonalizeContext): OutreachPersonalizeResult {
  const rendered = renderOutreachTemplate(ctx.templateSubject, ctx.templateBody, {
    candidateName: ctx.candidateName,
    candidateEmail: ctx.candidateEmail,
    jobTitle: ctx.jobTitle,
    recruiterName: ctx.recruiterName,
    companyName: ctx.companyName,
  });

  const profile = ctx.candidateProfile?.toLowerCase() ?? "";
  const highlights: string[] = [];
  if (profile.includes("typescript")) highlights.push("TypeScript experience");
  if (profile.includes("leadership")) highlights.push("Leadership signals");
  if (profile.includes("distributed")) highlights.push("Distributed systems background");

  let bodyText = rendered.bodyText;
  if (highlights.length) {
    bodyText += `\n\nI was especially interested in your background in ${highlights.slice(0, 2).join(" and ")}.`;
  }

  return {
    subject: rendered.subject,
    bodyText,
    tone: ctx.tone ?? "professional",
    highlights,
    explanation: heuristicExplanation(),
  };
}

function heuristicExplanation(): string {
  if (!hasLlmProvider()) {
    return `Template-based personalization (no LLM configured). ${llmSetupHint()}`;
  }
  const provider = getActiveLlmProviderId() ?? "llm";
  return `Template-based personalization (${provider} call failed — using heuristics).`;
}

export async function personalizeOutreachMessage(
  ctx: PersonalizeContext
): Promise<OutreachPersonalizeResult> {
  const fallback = heuristicPersonalize(ctx);

  const userPrompt = `Tone: ${ctx.tone ?? "professional"}
Recruiter: ${ctx.recruiterName ?? "Hiring team"}
Company: ${ctx.companyName ?? "Company"}
Role: ${ctx.jobTitle ?? "Open role"}
Requirements: ${ctx.jobRequirements ?? "Not specified"}
Description: ${ctx.jobDescription?.slice(0, 800) ?? "Not specified"}

Candidate: ${ctx.candidateName} (${ctx.candidateEmail ?? "no email"})
Profile excerpt:
${(ctx.candidateProfile ?? "No profile text").slice(0, 2500)}

Base template subject: ${ctx.templateSubject}
Base template body:
${ctx.templateBody.slice(0, 1200)}`;

  return chatJson<OutreachPersonalizeResult>(SYSTEM_PROMPT, userPrompt, fallback);
}

export type { OutreachTemplateVariables };
