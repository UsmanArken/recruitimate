import { getJobById } from "@/lib/services/job.service";
import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";
import { generateInterviewQuestionBank } from "@/lib/intelligence/interview/question-bank-engine";
import type { InterviewQuestionBankInput } from "@/lib/validators/interview-questions";

export async function generateJobInterviewQuestions(
  ctx: AuthContext,
  jobId: string,
  input: InterviewQuestionBankInput
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  await assertPermission(ctx, { resource: "jobs", action: "read", jobId });

  const job = await getJobById(ctx, jobId);

  const result = await generateInterviewQuestionBank({
    jobTitle: job.title,
    jobDescription: job.description,
    jobRequirements: job.requirements,
    focus: input.focus,
    count: input.count,
  });

  return {
    ...result,
    jobId: job.id,
    jobTitle: job.title,
  };
}
