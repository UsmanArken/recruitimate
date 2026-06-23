import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { copilotChatSchema } from "@/lib/validators/copilot";
import * as copilotService from "@/lib/services/copilot.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, copilotChatSchema);
      const result = await copilotService.chatWithCopilot(ctx, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const context = await copilotService.listCopilotJobs(ctx);
      return jsonOk(context);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
