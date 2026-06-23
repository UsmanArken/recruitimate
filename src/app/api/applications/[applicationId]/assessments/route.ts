import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as assessmentService from "@/lib/services/assessment.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const result = await assessmentService.listApplicationAssessments(ctx, applicationId);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
