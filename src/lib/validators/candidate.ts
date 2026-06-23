import { z } from "zod";

export const createCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  /** Open position — omit for talent-pool (generic) screening. */
  jobId: z.string().min(1).optional().or(z.literal("")),
  resumeText: z.string().min(20),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  linkedInText: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  sourceFileName: z.string().optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
