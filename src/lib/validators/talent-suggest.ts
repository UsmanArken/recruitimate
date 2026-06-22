import { z } from "zod";

export const talentSuggestSchema = z.object({
  limit: z.number().int().min(1).max(25).optional().default(10),
  poolId: z.string().cuid().optional(),
});
