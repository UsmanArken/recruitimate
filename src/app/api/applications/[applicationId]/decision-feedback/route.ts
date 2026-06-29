import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { recommendationFeedbackSchema } from "@/lib/validators/learning";
import * as feedbackService from "@/lib/services/recommendation-feedback.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const input = await parseJsonBody(req, recommendationFeedbackSchema);
      const feedback = await feedbackService.submitRecommendationFeedback(
        ctx,
        applicationId,
        input
      );
      return jsonOk({ feedback });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
