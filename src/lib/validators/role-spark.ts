import { z } from "zod";

export const roleSparkSchema = z.object({
  title: z.string().trim().min(1, "Job title is required"),
  keywords: z
    .string()
    .trim()
    .min(3, "Add a few keywords — skills, stack, or domain (e.g. Python, fintech, remote)"),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD", "DIRECTOR"]).optional(),
  location: z.string().trim().max(120).optional(),
  workModel: z.enum(["ONSITE", "HYBRID", "REMOTE"]).optional(),
  teamContext: z.string().trim().max(500).optional(),
});

export type RoleSparkInput = z.infer<typeof roleSparkSchema>;

export type RoleSparkDraft = {
  description: string;
  requirements: string;
  jobPostDocument: string;
};
