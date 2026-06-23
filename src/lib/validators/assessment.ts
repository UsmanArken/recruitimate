import { z } from "zod";

export const assessmentTaskKindSchema = z.enum(["code", "product", "ops", "scenario", "all"]);

export const generateAssessmentTasksSchema = z.object({
  focus: assessmentTaskKindSchema.optional().default("all"),
  count: z.number().int().min(1).max(6).optional().default(3),
});

export const submitAssessmentSchema = z.object({
  responseText: z.string().min(50).max(50000),
  responseUrl: z.string().url().optional().or(z.literal("")),
});

export const evaluateAssessmentSchema = z.object({
  responseText: z.string().min(50).max(50000).optional(),
});
