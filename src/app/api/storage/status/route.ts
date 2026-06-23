import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { describeStorageBackend } from "@/lib/storage/provider";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      return jsonOk(describeStorageBackend());
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
