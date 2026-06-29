import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as scoringModelService from "@/lib/services/scoring-model.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const data = await scoringModelService.getScoringModel(ctx);
      return jsonOk(data);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
