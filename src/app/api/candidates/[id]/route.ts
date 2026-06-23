import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { parseJsonBody } from "@/lib/api/request";
import { updateCandidateMarkingSchema } from "@/lib/validators/candidate-profile";
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const input = await parseJsonBody(req, updateCandidateMarkingSchema);
    const candidate = await candidateService.updateCandidateMarking(ctx, id, input);
    return jsonOk(candidate);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    await candidateService.deleteCandidate(ctx, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
