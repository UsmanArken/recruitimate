import { handleRouteError, jsonCreated } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/request";
import { z } from "zod";
import * as organizationService from "@/lib/services/organization.service";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const input = await parseJsonBody(req, signupSchema);
    const result = await organizationService.signupWithOrganization(input);
    return jsonCreated({
      userId: result.user.id,
      organizationId: result.organization.id,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
