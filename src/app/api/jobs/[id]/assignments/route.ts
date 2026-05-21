import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createJobAssignmentSchema } from "@/lib/validators/job-assignment";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const job = await jobAssignmentService.getJobWithTeam(ctx, id);
    const { hasPermission } = await import("@/lib/auth/permission.service");
    const canManage = await hasPermission(ctx, { resource: "jobs", action: "update" });
    const members = canManage
      ? await jobAssignmentService.listAssignableMembers(ctx, id)
      : [];
    return jsonOk({ job, members, canManage });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const input = await parseJsonBody(req, createJobAssignmentSchema);
    const assignment = await jobAssignmentService.assignToJob(ctx, id, input);
    return jsonCreated(assignment);
  } catch (error) {
    return handleRouteError(error);
  }
}
