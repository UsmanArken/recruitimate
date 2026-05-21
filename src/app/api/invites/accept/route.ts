import { handleRouteError, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { z } from "zod";
import * as inviteService from "@/lib/services/invite.service";

const acceptSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const input = await parseJsonBody(req, acceptSchema);
    const result = await inviteService.acceptInvite(input);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
