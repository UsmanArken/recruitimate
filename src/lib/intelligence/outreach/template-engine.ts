import type { OutreachRenderedMessage, OutreachTemplateVariables } from "../types";

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;

export const DEFAULT_TEMPLATE_VARIABLES = [
  "candidateName",
  "candidateEmail",
  "jobTitle",
  "recruiterName",
  "companyName",
] as const;

export function extractTemplateVariables(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(VARIABLE_PATTERN)) {
    found.add(match[1]);
  }
  return [...found];
}

export function renderOutreachTemplate(
  subject: string,
  bodyMarkdown: string,
  vars: OutreachTemplateVariables
): OutreachRenderedMessage {
  const values: Record<string, string> = {
    candidateName: vars.candidateName,
    candidateEmail: vars.candidateEmail ?? "",
    jobTitle: vars.jobTitle ?? "an exciting opportunity",
    recruiterName: vars.recruiterName ?? "the hiring team",
    companyName: vars.companyName ?? "our team",
  };

  const replace = (input: string) =>
    input.replace(VARIABLE_PATTERN, (_, key: string) => values[key] ?? "");

  const renderedSubject = replace(subject).trim();
  const renderedBody = replace(bodyMarkdown).trim();
  const variablesUsed = extractTemplateVariables(`${subject}\n${bodyMarkdown}`);

  return {
    subject: renderedSubject,
    bodyText: renderedBody,
    variablesUsed,
  };
}

export function defaultOutreachTemplate(): {
  name: string;
  subject: string;
  bodyMarkdown: string;
} {
  return {
    name: "Initial outreach",
    subject: "{{jobTitle}} opportunity at {{companyName}}",
    bodyMarkdown: `Hi {{candidateName}},

I came across your profile and thought you could be a strong fit for our {{jobTitle}} role at {{companyName}}.

Would you be open to a brief conversation this week?

Best,
{{recruiterName}}`,
  };
}
