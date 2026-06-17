import { getAuthUser } from "@/lib/api-server";
import { redirect } from "next/navigation";
import { NewJobForm } from "@/app/jobs/new/new-job-form";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const user = await getAuthUser();
  if (user.isPlatformAdmin) redirect("/admin");
  return <NewJobForm />;
}
