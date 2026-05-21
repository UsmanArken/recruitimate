import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createCandidateSchema } from "@/lib/validators/candidate";
import * as candidateService from "@/lib/services/candidate.service";

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const candidates = await candidateService.listCandidates(ctx);
    return jsonOk(candidates);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const input = await parseJsonBody(req, createCandidateSchema);
    const candidate = await candidateService.createCandidate(ctx, input);
    return jsonCreated(candidate);
  } catch (error) {
    return handleRouteError(error);
  }
}
