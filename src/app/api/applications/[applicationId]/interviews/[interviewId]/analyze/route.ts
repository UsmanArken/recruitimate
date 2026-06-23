import { handleRouteError, jsonAccepted, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as interviewService from "@/lib/services/interview.service";

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
      const sync = new URL(req.url).searchParams.get("sync") === "true";

      if (sync) {
        const result = await interviewService.analyzeInterviewById(
          ctx,
          applicationId,
          interviewId
        );
        return jsonOk(result);
      }

      const queued = await interviewService.queueAnalyzeInterviewById(
        ctx,
        applicationId,
        interviewId
      );
      return jsonAccepted(queued);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
