import { NextResponse } from "next/server";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import * as billingService from "@/lib/services/billing.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const secret = req.headers.get("x-billing-webhook-secret");
      if (!billingService.isBillingWebhookAuthorized(secret)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const result = await billingService.handleBillingWebhook(payload);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
