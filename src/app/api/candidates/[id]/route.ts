import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as candidateService from "@/lib/services/candidate.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const candidate = await candidateService.getCandidateById(ctx, id);
    return jsonOk(candidate);
  } catch (error) {
    return handleRouteError(error);
  }
}
