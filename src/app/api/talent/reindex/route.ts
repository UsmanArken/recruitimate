import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { talentReindexSchema } from "@/lib/validators/talent-discovery";
import * as talentDiscoveryService from "@/lib/services/talent-discovery.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, talentReindexSchema);
      const result = await talentDiscoveryService.reindexOrganizationTalent(
        ctx,
        input.poolId
      );
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
