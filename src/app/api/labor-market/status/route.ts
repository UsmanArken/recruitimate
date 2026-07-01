import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as passiveSignalsService from "@/lib/services/passive-signals.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      await requireApiAuth();
      const status = await passiveSignalsService.getLaborMarketStatus();
      return jsonOk(status);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
