import { z } from "zod";

export const updateCandidateMarkingSchema = z.object({
  marking: z.enum(["ACTIVE", "ARCHIVED", "ON_HOLD"]),
});

export type UpdateCandidateMarkingInput = z.infer<typeof updateCandidateMarkingSchema>;
