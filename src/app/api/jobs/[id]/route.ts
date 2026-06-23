import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { parseJsonBody } from "@/lib/api/request";
import { updateJobSchema } from "@/lib/validators/job";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";
import * as jobService from "@/lib/services/job.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const job = await jobAssignmentService.getJobWithTeam(ctx, id);
    return jsonOk(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const input = await parseJsonBody(req, updateJobSchema);
    const job = await jobService.updateJob(ctx, id, input);
    return jsonOk(job);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    await jobService.deleteJob(ctx, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
