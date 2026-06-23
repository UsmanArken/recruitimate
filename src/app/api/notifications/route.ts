import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as notificationService from "@/lib/services/notification.service";
import { resolveEmailProviderId, notificationsEnabled } from "@/lib/email/config";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const notifications = await notificationService.listEmailNotifications(ctx);
      return jsonOk({
        provider: resolveEmailProviderId(),
        enabled: notificationsEnabled(),
        notifications,
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
