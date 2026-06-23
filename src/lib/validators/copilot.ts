import { z } from "zod";

export const copilotChatSchema = z.object({
  message: z.string().min(2).max(2000),
  jobId: z.string().cuid().optional(),
  applicationId: z.string().cuid().optional(),
  compareApplicationIds: z.tuple([z.string().cuid(), z.string().cuid()]).optional(),
  interviewId: z.string().cuid().optional(),
});
