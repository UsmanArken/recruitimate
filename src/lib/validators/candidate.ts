import { z } from "zod";

export const createCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  /** Open position / hiring campaign — required for meaningful intelligence. */
  jobId: z.string().min(1, "Select an open position for this applicant"),
  resumeText: z.string().min(20),
  resumeFilePath: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  linkedInText: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
