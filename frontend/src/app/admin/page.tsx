import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser, serverFetch } from "@/lib/api-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Building2, Briefcase, Eye, Shield, Users, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAuthUser();
  if (!user.isPlatformAdmin) redirect("/");

  const organizations = await serverFetch<Array<{
    id: string;
    name: string;
    slug: string;
    memberCount: number;
    jobCount: number;
    applicationCount: number;
  }>>("/api/admin/organizations");

  const stats = {
    organizations: organizations.length,
    users: organizations.reduce((acc, o) => acc + o.memberCount, 0),
    jobs: organizations.reduce((acc, o) => acc + o.jobCount, 0),
    candidates: organizations.reduce((acc, o) => acc + o.applicationCount, 0),
  };

  return (
    <>
      <PageHeader
        title="Platform administration"
        description="Your home as a SaaS operator — tenant list and platform metrics. Customer signups never receive this access."
      />

      <PageBody>
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Customer hiring data</p>
              <p className="text-sm text-muted">
                Optional read-only view across tenants — no posting roles or changing records.
              </p>
            </div>
            <Link
              href="/candidates?operatorBrowse=1"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
            >
              <Eye className="h-4 w-4" />
              Browse hiring pipeline
            </Link>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Stat label="Organizations" value={stats.organizations} icon={Building2} />
          <Stat label="Users" value={stats.users} icon={Users} />
          <Stat label="Jobs" value={stats.jobs} icon={Briefcase} />
          <Stat label="Applications" value={stats.candidates} icon={Shield} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant organizations</CardTitle>
            <CardDescription>
              {organizations.length} customer workspace{organizations.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <p className="text-sm text-muted">No customer organizations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Slug</th>
                      <th className="py-2 pr-4">Members</th>
                      <th className="py-2 pr-4">Jobs</th>
                      <th className="py-2">Applications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="border-b border-border/60">
                        <td className="py-3 pr-4 font-medium">{org.name}</td>
                        <td className="py-3 pr-4 text-muted">{org.slug}</td>
                        <td className="py-3 pr-4 tabular-nums">{org.memberCount}</td>
                        <td className="py-3 pr-4 tabular-nums">{org.jobCount}</td>
                        <td className="py-3 tabular-nums">{org.applicationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
