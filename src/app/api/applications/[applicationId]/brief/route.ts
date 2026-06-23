import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import { getApplicationById } from "@/lib/services/application.service";
import { buildCandidateBrief } from "@/lib/intelligence/brief/candidate-brief";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const application = await getApplicationById(ctx, applicationId);
      const brief = buildCandidateBrief(application);
      return jsonOk(brief);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
