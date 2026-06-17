import { getAuthUser, serverFetch } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { NewCandidateForm } from "@/components/features/candidates/new-candidate-form";
import { PageHeader, PageBody } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  const user = await getAuthUser();
  if (user.isPlatformAdmin) redirect("/admin");

  const jobs = await serverFetch<Array<{ id: string; title: string }>>("/api/jobs");

  return (
    <>
      <PageHeader
        title="Add candidate to a hiring campaign"
        description="Applicants are always screened against a specific open position — the way recruiting teams run requisitions."
      />
      <PageBody className="max-w-2xl">
        <NewCandidateForm jobs={jobs} loadError={null} />
      </PageBody>
    </>
  );
}
