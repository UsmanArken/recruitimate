import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { listApplications } from "@/lib/services/application.service";
import { listJobs } from "@/lib/services/job.service";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { CandidatesBulkIntakePanel } from "@/components/features/candidates/candidates-bulk-intake-panel";
import { CandidatesPipelineView } from "@/components/features/candidates/candidates-pipeline-view";
import { UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  let applications: Awaited<ReturnType<typeof listApplications>> = [];
  let jobs: Awaited<ReturnType<typeof listJobs>> = [];
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    const [apps, jobRows] = await Promise.all([listApplications(ctx), listJobs(ctx)]);
    applications = apps;
    jobs = jobRows;
  } catch {
    // DB not ready
  }

  const hasRoles = jobs.length > 0;
  const jobOptions = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Talent pool and position reviews — upload CVs in bulk or add individuals to open roles."
      >
        {!readOnly && (
          <ButtonLink href={hasRoles ? "/candidates/new" : "/jobs/new"}>
            <UserPlus className="h-4 w-4" />
            {hasRoles ? "Add candidate" : "Post open role"}
          </ButtonLink>
        )}
      </PageHeader>

      <PageBody>
        {!readOnly && <CandidatesBulkIntakePanel jobs={jobOptions} />}
        <CandidatesPipelineView
          applications={applications.map((app) => ({
            id: app.id,
            stage: app.stage,
            candidate: {
              id: app.candidate.id,
              name: app.candidate.name,
              email: app.candidate.email,
              marking: app.candidate.marking,
            },
            job: app.job,
            talentProfile: app.talentProfile,
            decision: app.decision,
          }))}
          jobs={jobOptions}
        />
      </PageBody>
    </>
  );
}
