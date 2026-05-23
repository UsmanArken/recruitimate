import { handleRouteError, jsonCreated } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createApplicationSchema } from "@/lib/validators/application";
import * as applicationService from "@/lib/services/application.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id: candidateId } = await params;
    const input = await parseJsonBody(req, createApplicationSchema);
    const application = await applicationService.createApplicationForCandidate(
      ctx,
      candidateId,
      input.jobId
    );
    return jsonCreated(application);
  } catch (error) {
    return handleRouteError(error);
  }
}
