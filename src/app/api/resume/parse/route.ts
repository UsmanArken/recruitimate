import { badRequest } from "@/lib/api/errors";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import * as resumeParseService from "@/lib/services/resume-parse.service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw badRequest("Missing resume file", "NO_FILE");
    }

    const result = await resumeParseService.parseResumeUpload(ctx, file);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
