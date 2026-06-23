import { handleRouteError, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { recruiterReviewSchema } from "@/lib/validators/recruiter-review";
import * as recruiterReviewService from "@/lib/services/recruiter-review.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { applicationId } = await params;
    const input = await parseJsonBody(req, recruiterReviewSchema);
    const application = await recruiterReviewService.saveRecruiterReview(
      ctx,
      applicationId,
      input
    );
    return jsonOk(application);
  } catch (error) {
    return handleRouteError(error);
  }
}
