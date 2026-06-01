import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createInterviewSchema } from "@/lib/validators/interview";
import * as interviewService from "@/lib/services/interview.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const interviews = await interviewService.listInterviewsForApplication(
        ctx,
        applicationId
      );
      return jsonOk(interviews);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { applicationId } = await params;
      const input = await parseJsonBody(req, createInterviewSchema);
      const result = await interviewService.handleCreateInterview(
        ctx,
        applicationId,
        input
      );
      return jsonCreated(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
