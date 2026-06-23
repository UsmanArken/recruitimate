import { notFound, redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getJobById } from "@/lib/services/job.service";
import { JobFormShell } from "@/components/features/jobs/job-form-shell";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireAuthContext();
  if (isPlatformReadOnlyWorkspace(ctx)) redirect("/admin");

  let job: Awaited<ReturnType<typeof getJobById>> | null = null;
  try {
    job = await getJobById(ctx, id);
  } catch {
    notFound();
  }
  if (!job) notFound();

  return (
    <JobFormShell
      jobId={job.id}
      title="Edit role"
      description="Update requisition details, job post copy, and client company link."
      submitLabel="Save changes"
      initial={{
        title: job.title,
        description: job.description,
        requirements: job.requirements ?? "",
        jobPostDocument: job.jobPostDocument ?? job.description,
        hiringClientId: job.hiringClientId ?? "",
      }}
    />
  );
}
