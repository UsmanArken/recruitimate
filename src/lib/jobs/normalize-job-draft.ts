export type JobDraftFields = {
  description: string;
  requirements: string;
  jobPostDocument: string;
};

/** LLMs often return bullet lists as arrays — coerce to editable text for forms. */
export function coerceJobDraftField(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          if (typeof record.text === "string") return record.text.trim();
          if (typeof record.item === "string") return record.item.trim();
        }
        return String(item).trim();
      })
      .filter(Boolean)
      .map((line) => (/^[-·*]\s/.test(line) ? line : `· ${line}`))
      .join("\n");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function normalizeJobDraft(draft: {
  description?: unknown;
  requirements?: unknown;
  jobPostDocument?: unknown;
}): JobDraftFields {
  return {
    description: coerceJobDraftField(draft.description).trim(),
    requirements: coerceJobDraftField(draft.requirements).trim(),
    jobPostDocument: coerceJobDraftField(draft.jobPostDocument).trim(),
  };
}
