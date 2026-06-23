import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { talentSuggestSchema } from "@/lib/validators/talent-suggest";
import * as talentSuggestService from "@/lib/services/talent-suggest.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id } = await params;
      const input = await parseJsonBody(req, talentSuggestSchema);
      const result = await talentSuggestService.suggestCandidatesForJobById(
        ctx,
        id,
        input
      );
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
