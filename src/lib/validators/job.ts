import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
