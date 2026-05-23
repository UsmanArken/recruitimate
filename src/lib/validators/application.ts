import { z } from "zod";

export const createApplicationSchema = z.object({
  jobId: z.string().min(1, "Select an open position"),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
