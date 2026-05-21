import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as candidateService from "@/lib/services/candidate.service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const result = await candidateService.rerunTalentAnalysis(ctx, id);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
