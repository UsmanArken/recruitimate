import { badRequest } from "@/lib/api/errors";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { requireApiAuth } from "@/lib/api/context";
import { importResumesBulk } from "@/lib/services/bulk-talent-pool-import.service";

export const runtime = "nodejs";

const MAX_FILES = 40;

export async function POST(req: Request) {
  try {
    const ctx = await requireApiAuth();
    const formData = await req.formData();
    const jobId = formData.get("jobId");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      throw badRequest("Add at least one resume file", "NO_FILES");
    }
    if (files.length > MAX_FILES) {
      throw badRequest(`Maximum ${MAX_FILES} files per upload`, "TOO_MANY_FILES");
    }

    const results = await importResumesBulk(ctx, files, {
      jobId: typeof jobId === "string" && jobId.trim() ? jobId.trim() : undefined,
    });

    return jsonOk({ results, mode: jobId ? "role" : "talent_pool" });
  } catch (error) {
    return handleRouteError(error);
  }
}
