import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import * as platformAdminService from "@/lib/services/platform-admin.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Building2, Briefcase, ChevronLeft, Shield, Users, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ctx = await requireAuthContext();
  if (!isPlatformSuperAdmin(ctx)) {
    redirect("/");
  }

  const [organizations, stats] = await Promise.all([
    platformAdminService.listOrganizations(ctx),
    platformAdminService.getPlatformStats(ctx),
  ]);

  const tenants = organizations.filter((o) => o.slug !== "recruitimate-platform");

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-4">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to workspace
        </Link>
      </div>

      <PageHeader
        title="Platform administration"
        description="Cross-tenant view for SaaS operators. Customer signups never receive this access."
      />

      <PageBody>
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Stat label="Organizations" value={stats.organizations} icon={Building2} />
          <Stat label="Users" value={stats.users} icon={Users} />
          <Stat label="Jobs" value={stats.jobs} icon={Briefcase} />
          <Stat label="Candidates" value={stats.candidates} icon={Shield} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant organizations</CardTitle>
            <CardDescription>
              {tenants.length} customer workspace{tenants.length === 1 ? "" : "s"} (excluding internal platform org)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tenants.length === 0 ? (
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
                      <th className="py-2">Candidates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((org) => (
                      <tr key={org.id} className="border-b border-border/60">
                        <td className="py-3 pr-4 font-medium">{org.name}</td>
                        <td className="py-3 pr-4 text-muted">{org.slug}</td>
                        <td className="py-3 pr-4 tabular-nums">{org._count.members}</td>
                        <td className="py-3 pr-4 tabular-nums">{org._count.jobs}</td>
                        <td className="py-3 tabular-nums">{org._count.candidates}</td>
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
