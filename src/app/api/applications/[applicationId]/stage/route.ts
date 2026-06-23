import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { updateApplicationStageSchema } from "@/lib/validators/pipeline";
import * as pipelineService from "@/lib/services/pipeline.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const input = await parseJsonBody(req, updateApplicationStageSchema);
      const application = await pipelineService.updateApplicationStage(
        ctx,
        applicationId,
        input.stage
      );
      return jsonOk(application);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
