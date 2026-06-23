import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { listJobs } from "@/lib/services/job.service";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { JobsListView } from "@/components/features/jobs/jobs-list-view";
import { Plus, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs: Awaited<ReturnType<typeof listJobs>> = [];
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    jobs = await listJobs(ctx);
  } catch {
    // DB not ready
  }

  return (
    <>
      <PageHeader
        title="Open roles"
        description="Hiring campaigns by client company — score candidates against each requisition."
      >
        {!readOnly && (
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
                description="Add a client company in settings, then post a role with a job post document."
                primaryAction={
                  readOnly
                    ? { href: "/admin", label: "Open Platform admin" }
                    : { href: "/jobs/new", label: "Post your first role" }
                }
                secondaryAction={
                  readOnly ? undefined : { href: "/settings/clients", label: "Add client company" }
                }
              />
            </CardContent>
          </Card>
        ) : (
          <JobsListView
            jobs={jobs.map((j) => ({
              id: j.id,
              title: j.title,
              description: j.description,
              hiringClient: j.hiringClient,
              _count: j._count,
            }))}
          />
        )}
      </PageBody>
    </>
  );
}
