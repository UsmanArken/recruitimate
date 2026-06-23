import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { interviewQuestionBankSchema } from "@/lib/validators/interview-questions";
import * as interviewQuestionService from "@/lib/services/interview-question.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id } = await params;
      const input = await parseJsonBody(req, interviewQuestionBankSchema);
      const result = await interviewQuestionService.generateJobInterviewQuestions(
        ctx,
        id,
        input
      );
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
