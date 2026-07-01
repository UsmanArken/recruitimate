import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import * as jobAssignmentService from "@/lib/services/job-assignment.service";
import { hasPermission } from "@/lib/auth/permission.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { JobAssignmentsPanel } from "@/components/features/jobs/job-assignments-panel";
import { BulkResumeUploadPanel } from "@/components/features/jobs/bulk-resume-upload-panel";
import { InterviewQuestionBankPanel } from "@/components/features/jobs/interview-question-bank-panel";
import { SuggestedCandidatesPanel } from "@/components/features/jobs/suggested-candidates-panel";
import { PassiveSignalsPanel } from "@/components/features/talent/passive-signals-panel";
import { AssessmentTaskPanel } from "@/components/features/jobs/assessment-task-panel";
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
    const readOnly = isPlatformReadOnlyWorkspace(ctx);
    canManageTeam =
      !readOnly && (await hasPermission(ctx, { resource: "jobs", action: "update" }));
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

        {canManageTeam && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bulk upload resumes</CardTitle>
              <CardDescription>
                Select a folder from your computer. We will import each resume as a candidate and
                screen them against this role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkResumeUploadPanel jobId={job.id} />
            </CardContent>
          </Card>
        )}

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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview preparation</CardTitle>
            <CardDescription>
              Generate a role-specific question bank from this requisition&apos;s description and
              requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewQuestionBankPanel jobId={job.id} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment tasks</CardTitle>
            <CardDescription>
              Generate real-world code, product, and ops scenarios for candidate evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssessmentTaskPanel jobId={job.id} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Passive market signals</CardTitle>
            <CardDescription>
              External labor market integration — discover passive candidates with openness and
              demand signals for this role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PassiveSignalsPanel jobId={job.id} jobTitle={job.title} />
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Talent suggestions</CardTitle>
            <CardDescription>
              Recommend internal candidates from your discovery corpus who are not already in this
              role&apos;s pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuggestedCandidatesPanel jobId={job.id} jobTitle={job.title} />
          </CardContent>
        </Card>

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
            <JobAssignmentsPanel jobId={job.id} readOnly={!canManageTeam} />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
