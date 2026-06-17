import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthUser, serverFetch } from "@/lib/api-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { JobAssignmentsPanel } from "@/components/features/jobs/job-assignments-panel";
import { BulkResumeUploadPanel } from "@/components/features/jobs/bulk-resume-upload-panel";
import { JobPipelineTable } from "@/components/features/jobs/job-pipeline-table";
import { InterviewQuestionBankPanel } from "@/components/features/jobs/interview-question-bank-panel";
import { ChevronLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user, job, applications] = await Promise.all([
    getAuthUser(),
    serverFetch<{
      id: string;
      title: string;
      description: string | null;
      requirements: string | null;
      applicationCount: number;
      hiringManagerId: string | null;
      assignments: Array<{ id: string; assignmentRole: string; user: { id: string; name: string | null; email: string } }>;
    }>(`/api/jobs/${id}`).catch(() => null),
    serverFetch<Array<{
      id: string;
      stage: string;
      candidate: { id: string; name: string };
      job: { id: string; title: string };
      talentProfile: { roleFitScore: number | null } | null;
      decision: { recommendation: string | null } | null;
    }>>(`/api/applications`).then(apps => apps.filter(a => a.job.id === id)).catch(() => []),
  ]);

  if (!job) notFound();

  const canManageTeam = !user.isPlatformAdmin;

  return (
    <>
      <div className="border-b border-border bg-card/90 px-8 py-4 backdrop-blur-sm">
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
        description={(job.description ?? "").slice(0, 200) + ((job.description?.length ?? 0) > 200 ? "…" : "")}
      />

      <PageBody>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">In pipeline</p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight">{job.applicationCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Hiring manager</p>
            <p className="mt-2 text-sm font-semibold">
              {job.assignments.find(a => a.assignmentRole === "HIRING_MANAGER")?.user.name ?? "Not assigned"}
            </p>
          </div>
        </div>

        {canManageTeam && (
          <Card className="mb-8 border-primary/15 shadow-md shadow-primary/5">
            <CardHeader>
              <CardTitle>Bulk screen resumes</CardTitle>
              <CardDescription>
                Drop a folder of PDF or DOCX resumes — each file becomes a screened applicant for
                this role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkResumeUploadPanel jobId={job.id} />
            </CardContent>
          </Card>
        )}

        <section id="job-pipeline" className="mb-8 scroll-mt-8">
          <JobPipelineTable applications={applications} />
        </section>

        {job.requirements && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Role requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{job.requirements}</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Hiring team
            </CardTitle>
            <CardDescription>
              {canManageTeam
                ? "Assign interviewers and hiring managers for this requisition."
                : "Who is assigned to this open role."}
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
