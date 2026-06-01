import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  action: z.literal("schedule"),
  title: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240).optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
});

export const analyzeInterviewSchema = z.object({
  action: z.literal("analyze"),
  title: z.string().min(1),
  transcript: z.string().min(50),
  interviewId: z.string().optional(),
});

export const createInterviewSchema = z.discriminatedUnion("action", [
  scheduleInterviewSchema,
  analyzeInterviewSchema,
]);

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type AnalyzeInterviewInput = z.infer<typeof analyzeInterviewSchema>;
export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
