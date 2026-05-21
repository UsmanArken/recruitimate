import { handleRouteError, jsonOk } from "@/lib/api/response";
import * as candidateService from "@/lib/services/candidate.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidate = await candidateService.getCandidateById(id);
    return jsonOk(candidate);
  } catch (error) {
    return handleRouteError(error);
  }
}
