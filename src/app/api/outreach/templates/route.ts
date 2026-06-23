import { handleRouteError, jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { parseJsonBody } from "@/lib/api/request";
import { requireApiAuth } from "@/lib/api/context";
import { createOutreachTemplateSchema } from "@/lib/validators/outreach";
import * as outreachService from "@/lib/services/outreach.service";

export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const templates = await outreachService.listOutreachTemplates(ctx);
      return jsonOk({ templates });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request) {
  return runApiRoute(req, async () => {
    try {
      const ctx = await requireApiAuth();
      const input = await parseJsonBody(req, createOutreachTemplateSchema);
      const template = await outreachService.createOutreachTemplate(ctx, input);
      return jsonOk(template);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
