import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { linkedInIngestSchema } from "@/lib/validators/linkedin";
import * as linkedInService from "@/lib/services/linkedin.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const { id } = await params;
      const input = await parseJsonBody(req, linkedInIngestSchema);
      const result = await linkedInService.ingestLinkedInForCandidate(ctx, id, input);
      return jsonOk(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
