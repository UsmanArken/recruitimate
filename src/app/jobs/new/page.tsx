import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { JobFormShell } from "@/components/features/jobs/job-form-shell";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const ctx = await requireAuthContext();
  if (isPlatformReadOnlyWorkspace(ctx)) {
    redirect("/admin");
  }
  return (
    <JobFormShell
      title="Post new role"
      description="Create a requisition with Role Spark or a client-linked JD draft. Job post document is required."
      submitLabel="Create role"
    />
  );
}
