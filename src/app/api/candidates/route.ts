import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { createCandidateSchema } from "@/lib/validators/candidate";
import * as candidateService from "@/lib/services/candidate.service";

export async function GET() {
  try {
    const candidates = await candidateService.listCandidates();
    return jsonOk(candidates);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const input = await parseJsonBody(req, createCandidateSchema);
    const candidate = await candidateService.createCandidate(input);
    return jsonCreated(candidate);
  } catch (error) {
    return handleRouteError(error);
  }
}
