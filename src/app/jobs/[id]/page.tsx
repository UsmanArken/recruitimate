import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";
import { hasPermission } from "@/lib/auth/permission.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { JobAssignmentsPanel } from "@/components/features/jobs/job-assignments-panel";
import { ChevronLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let job: Awaited<ReturnType<typeof jobAssignmentService.getJobWithTeam>> | null = null;
  let canManageTeam = false;

  try {
    const ctx = await requireAuthContext();
    job = await jobAssignmentService.getJobWithTeam(ctx, id);
    canManageTeam = await hasPermission(ctx, { resource: "jobs", action: "update" });
  } catch {
    notFound();
  }

  if (!job) notFound();

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-4">
        <Link
          href="/jobs"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to open roles
        </Link>
      </div>

      <PageHeader
        title={job.title}
        description={job.description.slice(0, 200) + (job.description.length > 200 ? "…" : "")}
      />

      <PageBody>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase text-muted">Candidates</p>
            <p className="mt-1 text-2xl font-bold">{job._count.applications}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase text-muted">Hiring manager</p>
            <p className="mt-1 text-sm font-medium">
              {job.hiringManager?.name ?? job.hiringManager?.email ?? "Not set"}
            </p>
          </div>
        </div>

        {job.requirements && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted">{job.requirements}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Job team
            </CardTitle>
            <CardDescription>
              {canManageTeam
                ? "Assign interviewers and hiring managers. Permissions are enforced via database ACL."
                : "View who is assigned to this requisition."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobAssignmentsPanel jobId={job.id} />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
