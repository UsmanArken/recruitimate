import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createJobSchema } from "@/lib/validators/job";
import * as jobService from "@/lib/services/job.service";

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const jobs = await jobService.listJobs(ctx);
    return jsonOk(jobs);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const input = await parseJsonBody(req, createJobSchema);
    const job = await jobService.createJob(ctx, input);
    return jsonCreated(job);
  } catch (error) {
    return handleRouteError(error);
  }
}
