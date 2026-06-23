import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createOutreachCampaignSchema } from "@/lib/validators/outreach";
import * as outreachService from "@/lib/services/outreach.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const campaigns = await outreachService.listOutreachCampaigns(ctx);
      return jsonOk({ campaigns });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, createOutreachCampaignSchema);
      const campaign = await outreachService.createOutreachCampaign(ctx, input);
      return jsonOk(campaign);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
