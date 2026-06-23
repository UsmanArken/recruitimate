import { handleRouteError, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { updateMemberRoleSchema } from "@/lib/validators/member";
import * as memberService from "@/lib/services/member.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { memberId } = await params;
    const input = await parseJsonBody(req, updateMemberRoleSchema);
    const member = await memberService.updateMemberRole(ctx, memberId, input);
    return jsonOk(member);
  } catch (error) {
    return handleRouteError(error);
  }
}
