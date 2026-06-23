import { z } from "zod";

export const talentSearchSchema = z.object({
  query: z.string().min(3).max(500),
  poolId: z.string().cuid().optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
});
