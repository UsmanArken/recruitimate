import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { submitAssessmentSchema } from "@/lib/validators/assessment";
import * as assessmentService from "@/lib/services/assessment.service";

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ applicationId: string; taskId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId, taskId } = await params;
      const input = await parseJsonBody(req, submitAssessmentSchema);
      const submission = await assessmentService.submitAssessmentResponse(
        ctx,
        applicationId,
        taskId,
        input.responseText,
        input.responseUrl
      );
      return jsonOk(submission);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
