import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { listJobs } from "@/lib/services/job.service";
import { NewCandidateForm } from "@/components/features/candidates/new-candidate-form";
import { PageHeader, PageBody } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  let jobs: { id: string; title: string }[] = [];
  let loadError: string | null = null;

  try {
    const ctx = await requireAuthContext();
    if (isPlatformReadOnlyWorkspace(ctx)) {
      redirect("/admin");
    }
    const rows = await listJobs(ctx);
    jobs = rows.map((j) => ({ id: j.id, title: j.title }));
  } catch {
    loadError = "Could not load open positions. Sign in again or check the database connection.";
  }

  return (
    <>
      <PageHeader
        title="Add candidate to a hiring campaign"
        description="Applicants are always screened against a specific open position — the way recruiting teams run requisitions."
      />
      <PageBody className="max-w-2xl">
        <NewCandidateForm jobs={jobs} loadError={loadError} />
      </PageBody>
    </>
  );
}
