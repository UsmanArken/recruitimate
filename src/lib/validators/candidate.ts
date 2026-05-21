import { z } from "zod";

export const createCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  jobId: z.string().optional(),
  resumeText: z.string().min(20),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
