import { badRequest } from "@/lib/api/errors";
import { requireApiAuth } from "@/lib/api/context";
import { handleRouteError, jsonOk } from "@/lib/api/response";
import { assertTenantWorkspaceWrite } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { getJobById } from "@/lib/services/job.service";
import { isAllowedResumeFile } from "@/lib/resume/extract-text";
import { importResumesForJob } from "@/lib/services/bulk-resume-import.service";

const MAX_FILES_PER_UPLOAD = 40;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireApiAuth();
    assertTenantWorkspaceWrite(ctx);
    await assertPermission(ctx, { resource: "candidates", action: "create" });

    const { id: jobId } = await params;
    await getJobById(ctx, jobId);

    const form = await req.formData();
    const files = form
      .getAll("files")
      .filter((f): f is File => f instanceof File && isAllowedResumeFile(f.name, f.type));

    if (files.length === 0) {
      throw badRequest("Select PDF or DOCX resumes to import", "NO_FILES");
    }
    if (files.length > MAX_FILES_PER_UPLOAD) {
      throw badRequest(
        `Please upload ${MAX_FILES_PER_UPLOAD} resumes or fewer at a time`,
        "TOO_MANY_FILES"
      );
    }

    const results = await importResumesForJob(ctx, jobId, files);

    const created = results.filter((r) => r.status === "created").length;
    const duplicate = results.filter((r) => r.status === "duplicate").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return jsonOk({
      jobId,
      created,
      duplicate,
      failed,
      results,
    });
  } catch (error) {
    return handleRouteError(error, { method: "POST", path: "/api/jobs/[id]/bulk-resumes" });
  }
}
