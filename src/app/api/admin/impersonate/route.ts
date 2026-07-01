import { cookies } from "next/headers";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { forbidden } from "@/lib/api/errors";
import { IMPERSONATE_ORG_COOKIE } from "@/lib/auth/impersonation";
import { isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import * as platformAnalyticsService from "@/lib/services/platform-analytics.service";
import { z } from "zod";

const impersonateSchema = z.object({
  organizationId: z.string().cuid(),
});

function cookieOptions() {
  return {
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const state = await platformAnalyticsService.getImpersonationState(ctx);
      return jsonOk(state);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, impersonateSchema);
      const org = await platformAnalyticsService.startImpersonation(ctx, input.organizationId);

      const cookieStore = await cookies();
      cookieStore.set(IMPERSONATE_ORG_COOKIE, org.id, cookieOptions());
      // Clear read-only browse mode when impersonating (full tenant write access)
      cookieStore.set("recruitimate-operator-browse", "", { ...cookieOptions(), maxAge: 0 });

      return jsonOk({ organization: org });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      if (!isPlatformSuperAdmin(ctx)) {
        return handleRouteError(forbidden("Platform super admin access required"));
      }
      const cookieStore = await cookies();
      cookieStore.set(IMPERSONATE_ORG_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
      return jsonOk({ cleared: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
