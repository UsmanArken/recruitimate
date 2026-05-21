import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";

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
