import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import { pipelineBoardQuerySchema } from "@/lib/validators/pipeline";
import * as pipelineService from "@/lib/services/pipeline.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const url = new URL(req.url);
      const query = pipelineBoardQuerySchema.parse({
        jobId: url.searchParams.get("jobId") ?? undefined,
      });
      const applications = await pipelineService.listPipelineBoard(ctx, query);
      return jsonOk({ applications });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
