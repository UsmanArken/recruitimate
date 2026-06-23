import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as memberService from "@/lib/services/member.service";

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const members = await memberService.listOrganizationMembers(ctx);
    return jsonOk(members);
  } catch (error) {
    return handleRouteError(error);
  }
}
