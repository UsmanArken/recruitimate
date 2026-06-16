import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { submitVideoMetricsSchema } from "@/lib/validators/video-metrics";
import * as videoMetricsService from "@/lib/services/video-metrics.service";

export async function POST(
  req: Request,
  {
    params,
  }: { params: Promise<{ applicationId: string; interviewId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId, interviewId } = await params;
      const input = await parseJsonBody(req, submitVideoMetricsSchema);
      const interview = await videoMetricsService.saveInterviewVideoMetrics(
        ctx,
        applicationId,
        interviewId,
        input
      );
      return jsonOk(interview);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
