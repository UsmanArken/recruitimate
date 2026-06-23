import { handleRouteError, jsonOk } from "@/lib/api/response";
import * as memberService from "@/lib/services/member.service";

export async function GET() {
  try {
    const roles = await memberService.listOrganizationRolesWithPermissions();
    return jsonOk(roles);
  } catch (error) {
    return handleRouteError(error);
  }
}
