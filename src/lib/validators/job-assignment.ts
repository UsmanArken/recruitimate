import { z } from "zod";

export const createJobAssignmentSchema = z.object({
  userId: z.string().min(1),
  assignmentRole: z.enum(["INTERVIEWER", "HIRING_MANAGER"]),
});

export type CreateJobAssignmentInput = z.infer<typeof createJobAssignmentSchema>;
