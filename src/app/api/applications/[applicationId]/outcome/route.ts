import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { recordOutcomeSchema } from "@/lib/validators/learning";
import * as outcomeService from "@/lib/services/outcome.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const outcome = await outcomeService.getOutcome(ctx, applicationId);
      return jsonOk({ outcome });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const input = await parseJsonBody(req, recordOutcomeSchema);
      const outcome = await outcomeService.recordOutcome(ctx, applicationId, input);
      return jsonOk({ outcome });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
