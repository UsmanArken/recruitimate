import { handleRouteError, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { forbidden } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite } from "@/lib/auth/platform-admin";
import { roleSparkSchema } from "@/lib/validators/role-spark";
import * as roleSparkService from "@/lib/services/role-spark.service";

/** Role Spark — JD from title + keywords without a client company profile. */
export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    assertTenantWorkspaceWrite(ctx);

    const [canCreate, canUpdate] = await Promise.all([
      hasPermission(ctx, { resource: "jobs", action: "create" }),
      hasPermission(ctx, { resource: "jobs", action: "update" }),
    ]);
    if (!canCreate && !canUpdate) {
      throw forbidden("Missing permission: jobs.create or jobs.update");
    }

    const input = await parseJsonBody(req, roleSparkSchema);
    const draft = await roleSparkService.generateRoleSparkDraft(input);
    return jsonOk(draft);
  } catch (error) {
    return handleRouteError(error);
  }
}
