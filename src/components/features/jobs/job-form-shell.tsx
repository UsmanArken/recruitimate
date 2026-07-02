import { listHiringClients } from "@/lib/services/hiring-client.service";
import { requireAuthContext } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { JobForm } from "@/components/features/jobs/job-form";

export async function JobFormShell({
  jobId,
  initial,
  title,
  description,
  submitLabel,
}: {
  jobId?: string;
  initial?: {
    title: string;
    description: string;
    requirements: string;
    jobPostDocument: string;
    hiringClientId: string;
  };
  title: string;
  description: string;
  submitLabel: string;
}) {
  const ctx = await requireAuthContext();
  const clients = await listHiringClients(ctx);

  return (
    <>
      <PageHeader title={title} description={description} />
      <PageBody className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Role details</CardTitle>
            <CardDescription>
              Use <strong className="font-semibold text-foreground">Role Spark</strong> for a
              keyword-driven JD in seconds, or link a client to draft from their company profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm
              clients={clients.map((c) => ({
                id: c.id,
                name: c.name,
                website: c.website,
              }))}
              jobId={jobId}
              initial={initial}
              submitLabel={submitLabel}
            />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
