import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { addPoolMemberSchema } from "@/lib/validators/talent-discovery";
import * as talentDiscoveryService from "@/lib/services/talent-discovery.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { poolId } = await params;
      const input = await parseJsonBody(req, addPoolMemberSchema);
      await talentDiscoveryService.addCandidateToPool(ctx, poolId, input.candidateId);
      return jsonOk({ ok: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
