import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { linkedInParseSchema } from "@/lib/validators/linkedin";
import * as linkedInService from "@/lib/services/linkedin.service";

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      await requireApiAuth();
      const input = await parseJsonBody(req, linkedInParseSchema);
      const parsed = await linkedInService.parseLinkedInPreview(input);
      return jsonOk(parsed);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
