import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { talentSearchSchema } from "@/lib/validators/talent-search";
import * as talentSearchService from "@/lib/services/talent-search.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, talentSearchSchema);
      const result = await talentSearchService.searchTalent(ctx, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
