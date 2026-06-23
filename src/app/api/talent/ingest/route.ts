import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { talentIngestSchema } from "@/lib/validators/talent-discovery";
import * as talentDiscoveryService from "@/lib/services/talent-discovery.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, talentIngestSchema);
      const result = await talentDiscoveryService.ingestTalentProfile(ctx, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
