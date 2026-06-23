import { z } from "zod";

export const liveAssistSchema = z.object({
  transcript: z.string().min(30, "Need at least a few sentences of live transcript"),
  interviewId: z.string().optional(),
});

export type LiveAssistInput = z.infer<typeof liveAssistSchema>;
