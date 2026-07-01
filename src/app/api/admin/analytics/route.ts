import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as platformAnalyticsService from "@/lib/services/platform-analytics.service";
import * as billingService from "@/lib/services/billing.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const [usage, billingEvents] = await Promise.all([
        platformAnalyticsService.getPlatformUsageAnalytics(ctx),
        billingService.listRecentBillingEvents(ctx, 15),
      ]);
      return jsonOk({ usage, billingEvents });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
