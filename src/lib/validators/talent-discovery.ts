import { z } from "zod";

export const talentDiscoverySourceSchema = z.enum([
  "manual",
  "resume",
  "linkedin",
  "bulk",
  "external",
]);

export const createTalentPoolSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
});

export const talentIngestSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  resumeText: z.string().max(50000).optional(),
  linkedInText: z.string().max(50000).optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  source: talentDiscoverySourceSchema.default("manual"),
  poolId: z.string().cuid().optional(),
});

export const addPoolMemberSchema = z.object({
  candidateId: z.string().cuid(),
});

export const talentReindexSchema = z.object({
  poolId: z.string().cuid().optional(),
});
