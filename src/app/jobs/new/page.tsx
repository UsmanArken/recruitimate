import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { NewJobForm } from "@/app/jobs/new/new-job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const ctx = await requireAuthContext();
  if (isPlatformReadOnlyWorkspace(ctx)) {
    redirect("/admin");
  }
  return <NewJobForm />;
}
