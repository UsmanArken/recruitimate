import Link from "next/link";
import { serverFetch } from "@/lib/api-server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowRight, Briefcase, Plus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await serverFetch<Array<{
    id: string;
    title: string;
    description: string | null;
    applicationCount: number;
  }>>("/api/jobs");

  return (
    <>
      <PageHeader
        title="Open roles"
        description="Define positions to power role-fit scoring and keep candidates organized by requisition."
      >
        <ButtonLink href="/jobs/new">
          <Plus className="h-4 w-4" />
          Post new role
        </ButtonLink>
      </PageHeader>

      <PageBody>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Briefcase}
                title="No open roles yet"
                description="Every hiring campaign starts with a requisition. Add the role title, description, and requirements so Recruitimate can score role fit on resumes."
                primaryAction={{ href: "/jobs/new", label: "Post your first role" }}
                secondaryAction={{ href: "/", label: "Back to dashboard" }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="transition hover:border-primary/30 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                          <Briefcase className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                          <CardTitle>{job.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {job.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
                      <Users className="h-4 w-4" />
                      {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}{" "}
                      in pipeline · Manage team →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
