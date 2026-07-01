import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import * as platformAdminService from "@/lib/services/platform-admin.service";
import * as platformAnalyticsService from "@/lib/services/platform-analytics.service";
import * as billingService from "@/lib/services/billing.service";
import { TenantAdminActions } from "@/components/features/admin/tenant-admin-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import {
  Building2,
  Briefcase,
  Eye,
  Shield,
  Users,
  Activity,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const ctx = await requireAuthContext();
  if (!isPlatformSuperAdmin(ctx)) {
    redirect("/");
  }

  const [organizations, stats, usage, billingEvents, impersonation] = await Promise.all([
    platformAdminService.listOrganizations(ctx),
    platformAdminService.getPlatformStats(ctx),
    platformAnalyticsService.getPlatformUsageAnalytics(ctx),
    billingService.listRecentBillingEvents(ctx, 10),
    platformAnalyticsService.getImpersonationState(ctx),
  ]);

  const usageByOrg = new Map(usage.map((row) => [row.organizationId, row]));
  const tenants = organizations;

  return (
    <>
      <PageHeader
        title="Platform administration"
        description="Tenant usage, billing hooks, and impersonation for support. Customer signups never receive this access."
      />

      <PageBody>
        {impersonation.active ? (
          <Card className="mb-8 border-emerald-300/60 bg-emerald-50/80">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Impersonating {impersonation.organization.name}
                </p>
                <p className="text-sm text-emerald-900/80">
                  Full write access to this tenant workspace. Exit when finished.
                </p>
              </div>
              <TenantAdminActions
                organizationId={impersonation.organization.id}
                organizationName={impersonation.organization.name}
                isImpersonating
              />
            </CardContent>
          </Card>
        ) : null}

        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Customer hiring data</p>
              <p className="text-sm text-muted">
                Read-only browse across tenants, or impersonate a tenant below for full access.
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
          <Stat label="Candidates" value={stats.candidates} icon={Shield} />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage analytics
            </CardTitle>
            <CardDescription>
              Per-tenant activity (30-day application updates, plan, and seat usage)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usage.length === 0 ? (
              <p className="text-sm text-muted">No customer organizations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase text-muted">
                      <th className="py-2 pr-4">Tenant</th>
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Seats</th>
                      <th className="py-2 pr-4">Apps</th>
                      <th className="py-2 pr-4">Interviews</th>
                      <th className="py-2 pr-4">Active 30d</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.map((row) => (
                      <tr key={row.organizationId} className="border-b border-border/60">
                        <td className="py-3 pr-4">
                          <p className="font-medium">{row.name}</p>
                          <p className="text-xs text-muted">{row.slug}</p>
                        </td>
                        <td className="py-3 pr-4">{row.plan}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {row.seatUsage}/{row.seatLimit}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">{row.applications}</td>
                        <td className="py-3 pr-4 tabular-nums">{row.interviews}</td>
                        <td className="py-3 pr-4 tabular-nums">{row.activeApplications30d}</td>
                        <td className="py-3">
                          <TenantAdminActions
                            organizationId={row.organizationId}
                            organizationName={row.name}
                            isImpersonating={
                              impersonation.active &&
                              impersonation.organization.id === row.organizationId
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent billing events
            </CardTitle>
            <CardDescription>
              Webhook and seat snapshots from POST /api/billing/webhook
            </CardDescription>
          </CardHeader>
          <CardContent>
            {billingEvents.length === 0 ? (
              <p className="text-sm text-muted">No billing events recorded yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {billingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
                  >
                    <span className="font-medium">{event.type}</span>
                    <span className="text-muted">
                      {event.organization?.name ?? "—"} ·{" "}
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant organizations</CardTitle>
            <CardDescription>
              {tenants.length} customer workspace{tenants.length === 1 ? "" : "s"} (excluding
              internal platform org)
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
                      <th className="py-2 pr-4">Candidates</th>
                      <th className="py-2">Outcomes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((org) => {
                      const u = usageByOrg.get(org.id);
                      return (
                        <tr key={org.id} className="border-b border-border/60">
                          <td className="py-3 pr-4 font-medium">{org.name}</td>
                          <td className="py-3 pr-4 text-muted">{org.slug}</td>
                          <td className="py-3 pr-4 tabular-nums">{org._count.members}</td>
                          <td className="py-3 pr-4 tabular-nums">{org._count.jobs}</td>
                          <td className="py-3 pr-4 tabular-nums">{org._count.candidates}</td>
                          <td className="py-3 tabular-nums">{u?.outcomes ?? "—"}</td>
                        </tr>
                      );
                    })}
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
