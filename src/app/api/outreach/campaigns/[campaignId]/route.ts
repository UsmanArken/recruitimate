import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { updateOutreachCampaignSchema } from "@/lib/validators/outreach";
import * as outreachService from "@/lib/services/outreach.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { campaignId } = await params;
      const campaign = await outreachService.getOutreachCampaign(ctx, campaignId);
      return jsonOk(campaign);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { campaignId } = await params;
      const input = await parseJsonBody(req, updateOutreachCampaignSchema);
      const campaign = await outreachService.updateOutreachCampaign(ctx, campaignId, input);
      return jsonOk(campaign);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
