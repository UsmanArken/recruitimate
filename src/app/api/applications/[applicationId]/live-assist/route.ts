import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { liveAssistSchema } from "@/lib/validators/live-assist";
import * as liveAssistService from "@/lib/services/live-assist.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const input = await parseJsonBody(req, liveAssistSchema);
      const result = await liveAssistService.generateApplicationLiveAssist(
        ctx,
        applicationId,
        input
      );
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
