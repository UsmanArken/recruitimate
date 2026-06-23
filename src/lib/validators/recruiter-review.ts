import { z } from "zod";

export const recruiterReviewSchema = z.object({
  kind: z.enum(["talent", "hire"]),
  verdict: z.enum(["PENDING", "PASS", "FAIL", "HOLD"]),
  notes: z.string().max(5000).optional(),
});

export type RecruiterReviewInput = z.infer<typeof recruiterReviewSchema>;
