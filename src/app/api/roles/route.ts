import { handleRouteError, jsonOk } from "@/lib/api/response";
import * as inviteService from "@/lib/services/invite.service";

export async function GET() {
  try {
    const roles = await inviteService.listOrgRoles();
    return jsonOk(roles);
  } catch (error) {
    return handleRouteError(error);
  }
}
