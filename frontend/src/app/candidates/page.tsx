import { serverFetch } from "@/lib/api-server";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CandidatesPipelineView } from "@/components/features/candidates/candidates-pipeline-view";
import type { PipelineApplicationRow } from "@/components/features/candidates/candidates-pipeline-view";
import { UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const [applications, jobs] = await Promise.all([
    serverFetch<PipelineApplicationRow[]>("/api/applications"),
    serverFetch<Array<{ id: string; title: string }>>("/api/jobs"),
  ]);

  const hasRoles = jobs.length > 0;

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Talent pool and position reviews — upload CVs in bulk or add individuals to open roles."
      >
        <ButtonLink href={hasRoles ? "/candidates/new" : "/jobs/new"}>
          <UserPlus className="h-4 w-4" />
          {hasRoles ? "Add candidate" : "Post open position"}
        </ButtonLink>
      </PageHeader>

      <PageBody>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Users}
                title="No applicants in review yet"
                description={
                  hasRoles
                    ? "Add someone to an open position to run resume screening, role fit, and interview intelligence."
                    : "Post an open position first — applicants are always evaluated against a specific hiring campaign."
                }
                primaryAction={
                  hasRoles
                    ? { href: "/candidates/new", label: "Add first applicant" }
                    : { href: "/jobs/new", label: "Post open position" }
                }
                secondaryAction={
                  hasRoles
                    ? { href: "/jobs", label: "View open roles" }
                    : { href: "/", label: "See getting started guide" }
                }
              />
            </CardContent>
          </Card>
        ) : (
          <CandidatesPipelineView applications={applications} jobs={jobs} />
        )}
      </PageBody>
    </>
  );
}
