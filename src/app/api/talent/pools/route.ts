import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createTalentPoolSchema } from "@/lib/validators/talent-discovery";
import * as talentDiscoveryService from "@/lib/services/talent-discovery.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const pools = await talentDiscoveryService.listTalentPools(ctx);
      return jsonOk({ pools });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, createTalentPoolSchema);
      const pool = await talentDiscoveryService.createTalentPool(ctx, input);
      return jsonOk(pool);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
