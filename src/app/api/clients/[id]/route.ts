import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { parseJsonBody } from "@/lib/api/request";
import { updateHiringClientSchema } from "@/lib/validators/hiring-client";
import * as hiringClientService from "@/lib/services/hiring-client.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    const { id } = await params;
    const client = await hiringClientService.getHiringClientById(ctx, id);
    return jsonOk(client);
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
    const input = await parseJsonBody(req, updateHiringClientSchema);
    const client = await hiringClientService.updateHiringClient(ctx, id, input);
    return jsonOk(client);
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
    await hiringClientService.deleteHiringClient(ctx, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
