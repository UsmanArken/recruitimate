import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { z } from "zod";
import * as inviteService from "@/lib/services/invite.service";

const createInviteSchema = z.object({
  email: z.string().email(),
  roleCode: z.enum(["ORG_ADMIN", "RECRUITER", "HIRING_MANAGER"]),
});

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const invites = await inviteService.listInvites(ctx);
    return jsonOk(invites);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const input = await parseJsonBody(req, createInviteSchema);
    const invite = await inviteService.createInvite(ctx, input);
    return jsonCreated(invite);
  } catch (error) {
    return handleRouteError(error);
  }
}
