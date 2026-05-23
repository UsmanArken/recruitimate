import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as applicationService from "@/lib/services/application.service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { applicationId } = await params;
    const result = await applicationService.rerunApplicationIntelligence(
      ctx,
      applicationId
    );
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
