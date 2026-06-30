import { getAuthUser, serverFetch } from "@/lib/api-server";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { JobsListView } from "@/components/features/jobs/jobs-list-view";
import type { JobRow } from "@/components/features/jobs/jobs-list-view";
import { Briefcase, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const [jobs, user] = await Promise.all([
    serverFetch<JobRow[]>("/api/jobs"),
    getAuthUser(),
  ]);
  const isHiringManager = user.roleCode === "HIRING_MANAGER";

  return (
    <>
      <PageHeader
        title="Open roles"
        description="Hiring campaigns by client company — score candidates against each requisition."
      >
        {!isHiringManager && (
          <ButtonLink href="/jobs/new">
            <Plus className="h-4 w-4" />
            Post new role
          </ButtonLink>
        )}
      </PageHeader>

      <PageBody>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Briefcase}
                title="No open roles yet"
                description="Every hiring campaign starts with a requisition. Add the role title, description, and requirements so Recruitimate can score role fit on resumes."
                primaryAction={!isHiringManager ? { href: "/jobs/new", label: "Post your first role" } : undefined}
                secondaryAction={{ href: "/settings/team", label: "Team & access" }}
              />
            </CardContent>
          </Card>
        ) : (
          <JobsListView jobs={jobs} />
        )}
      </PageBody>
    </>
  );
}
