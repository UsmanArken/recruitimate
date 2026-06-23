import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { updateOutreachMessageSchema } from "@/lib/validators/outreach";
import * as outreachService from "@/lib/services/outreach.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { messageId } = await params;
      const input = await parseJsonBody(req, updateOutreachMessageSchema);
      const message = await outreachService.updateOutreachMessage(ctx, messageId, input);
      return jsonOk(message);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
