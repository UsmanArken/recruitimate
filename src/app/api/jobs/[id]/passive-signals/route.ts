import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as passiveSignalsService from "@/lib/services/passive-signals.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id: jobId } = await params;
      const cached = await passiveSignalsService.listCachedPassiveSignals(ctx, jobId);
      return jsonOk({ signals: cached });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id: jobId } = await params;
      const signals = await passiveSignalsService.refreshPassiveSignals(ctx, jobId);
      return jsonOk({ signals });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
