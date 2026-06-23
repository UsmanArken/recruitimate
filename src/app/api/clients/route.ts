import { handleRouteError, jsonCreated, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { parseJsonBody } from "@/lib/api/request";
import {
  createHiringClientSchema,
} from "@/lib/validators/hiring-client";
import * as hiringClientService from "@/lib/services/hiring-client.service";

export async function GET() {
  try {
    const ctx = await requireApiAuth();
    const clients = await hiringClientService.listHiringClients(ctx);
    return jsonOk(clients);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const input = await parseJsonBody(req, createHiringClientSchema);
    const client = await hiringClientService.createHiringClient(ctx, input);
    return jsonCreated(client);
  } catch (error) {
    return handleRouteError(error);
  }
}
