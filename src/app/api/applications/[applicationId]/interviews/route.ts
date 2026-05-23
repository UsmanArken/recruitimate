import { handleRouteError, jsonCreated } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createInterviewSchema } from "@/lib/validators/interview";
import * as interviewService from "@/lib/services/interview.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { applicationId } = await params;
    const input = await parseJsonBody(req, createInterviewSchema);
    const result = await interviewService.createInterviewAndAnalyze(
      ctx,
      applicationId,
      input
    );
    return jsonCreated(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
