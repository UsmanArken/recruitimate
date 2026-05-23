import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as applicationService from "@/lib/services/application.service";

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const applications = await applicationService.listApplications(ctx);
    return jsonOk(applications);
  } catch (error) {
    return handleRouteError(error);
  }
}
