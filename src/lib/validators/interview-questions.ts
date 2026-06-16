import { z } from "zod";

export const interviewQuestionBankSchema = z.object({
  focus: z
    .enum(["all", "technical", "behavioral", "situational", "role_fit", "culture"])
    .optional()
    .default("all"),
  count: z.number().int().min(5).max(20).optional().default(10),
});

export type InterviewQuestionBankInput = z.output<typeof interviewQuestionBankSchema>;
