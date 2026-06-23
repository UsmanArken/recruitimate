import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { requireApiAuth } from "@/lib/api/context";
import * as backgroundJobService from "@/lib/services/background-job.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { jobId } = await params;
      const job = await backgroundJobService.getBackgroundJob(ctx, jobId);
      return jsonOk(job);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
