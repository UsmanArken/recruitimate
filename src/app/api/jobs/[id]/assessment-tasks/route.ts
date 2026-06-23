import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { generateAssessmentTasksSchema } from "@/lib/validators/assessment";
import * as assessmentService from "@/lib/services/assessment.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id } = await params;
      const tasks = await assessmentService.listJobAssessmentTasks(ctx, id);
      return jsonOk({ tasks });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id } = await params;
      const input = await parseJsonBody(req, generateAssessmentTasksSchema);
      const result = await assessmentService.generateJobAssessmentTasks(ctx, id, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
