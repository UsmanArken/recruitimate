import { handleRouteError, jsonOk } from "@/lib/api/response";
import * as inviteService from "@/lib/services/invite.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invite = await inviteService.getInviteByToken(token);
    return jsonOk({
      email: invite.email,
      organization: { name: invite.organization.name },
      role: { name: invite.role.name, code: invite.role.code },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
