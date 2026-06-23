import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  description: z.string().trim().min(1, "Internal description is required"),
  requirements: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  jobPostDocument: z
    .string()
    .trim()
    .min(20, "Job post document is required (at least 20 characters)"),
  hiringClientId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export function formatApiValidationError(data: {
  error?: string;
  details?: { fieldErrors?: Record<string, string[]> };
}): string {
  const fieldErrors = data.details?.fieldErrors;
  if (fieldErrors) {
    const first = Object.entries(fieldErrors).find(([, messages]) => messages?.length);
    if (first) {
      const [field, messages] = first;
      const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
      return `${label}: ${messages![0]}`;
    }
  }
  return typeof data.error === "string" ? data.error : "Failed to save role";
}
