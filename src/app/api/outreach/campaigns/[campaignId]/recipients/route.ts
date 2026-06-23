import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { addOutreachRecipientsSchema } from "@/lib/validators/outreach";
import * as outreachService from "@/lib/services/outreach.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { campaignId } = await params;
      const input = await parseJsonBody(req, addOutreachRecipientsSchema);
      const result = await outreachService.addOutreachRecipients(ctx, campaignId, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
