import { z } from "zod";

export const createInterviewSchema = z.object({
  title: z.string().min(1),
  transcript: z.string().min(50),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
