import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as successPredictionService from "@/lib/services/success-prediction.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const prediction =
        await successPredictionService.getApplicationSuccessPrediction(ctx, applicationId);
      return jsonOk({ prediction });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
