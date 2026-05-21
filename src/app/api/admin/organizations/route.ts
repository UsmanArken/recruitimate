import { jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as platformAdminService from "@/lib/services/platform-admin.service";

export async function GET() {
  const ctx = await requireApiAuth();
  const organizations = await platformAdminService.listOrganizations(ctx);
  const stats = await platformAdminService.getPlatformStats(ctx);
  return jsonOk({ organizations, stats });
}
