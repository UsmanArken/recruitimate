import { handleRouteError, jsonCreated } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { createInterviewSchema } from "@/lib/validators/interview";
import * as interviewService from "@/lib/services/interview.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const input = await parseJsonBody(req, createInterviewSchema);
    const result = await interviewService.createInterviewAndAnalyze(id, input);
    return jsonCreated(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
