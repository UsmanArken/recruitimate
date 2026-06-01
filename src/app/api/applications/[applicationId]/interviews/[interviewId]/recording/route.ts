import { badRequest } from "@/lib/api/errors";
import { handleRouteError, jsonOk } from "@/lib/api/response";
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
      const form = await req.formData();
      const file = form.get("recording");
      if (!(file instanceof File)) {
        return handleRouteError(badRequest("Recording file required", "NO_FILE"));
      }
      const interview = await interviewService.uploadInterviewRecording(
        ctx,
        applicationId,
        interviewId,
        file
      );
      return jsonOk(interview);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
