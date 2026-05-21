import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id, assignmentId } = await params;
    const result = await jobAssignmentService.removeJobAssignment(
      ctx,
      id,
      assignmentId
    );
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
