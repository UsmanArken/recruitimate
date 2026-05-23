import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GettingStartedCard } from "@/components/features/onboarding/getting-started-card";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getDashboardData } from "@/lib/services/dashboard.service";
import { getWorkspaceOnboarding } from "@/lib/services/onboarding.service";
import { formatScore, scoreColor } from "@/lib/utils";
import { ArrowRight, Users, Briefcase, Mic, TrendingUp, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

function decisionStatusLabel(
  recommendation: string | null | undefined,
  hireConfidence: number | null | undefined
): string {
  if (recommendation === "pending_interview") return "Awaiting interview";
  if (hireConfidence != null) return `${Math.round(hireConfidence * 100)}% confidence`;
  return "—";
}

export default async function DashboardPage() {
  let stats = {
    candidates: 0,
    applications: 0,
    jobs: 0,
    interviewed: 0,
    avgConfidence: null as number | null,
  };
  let recent: Awaited<ReturnType<typeof getDashboardData>>["recentApplications"] = [];
  let onboarding: Awaited<ReturnType<typeof getWorkspaceOnboarding>> | null = null;
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    if (isPlatformReadOnlyWorkspace(ctx)) {
      redirect("/admin");
    }
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    const [data, onboardingState] = await Promise.all([
      getDashboardData(ctx),
      getWorkspaceOnboarding(ctx),
    ]);
    stats = data.stats;
    recent = data.recentApplications;
    onboarding = onboardingState;
  } catch {
    // DB not connected yet
  }

  return (
    <>
      <PageHeader
        title="Hiring dashboard"
        description={
          readOnly
            ? "Cross-tenant read-only view of customer hiring activity."
            : "Your team's command center for talent review, interview signals, and hire recommendations."
        }
      >
        {!readOnly && (
          <ButtonLink href="/candidates/new">
            <UserPlus className="h-4 w-4" />
            Add candidate
          </ButtonLink>
        )}
      </PageHeader>

      <PageBody>
        {onboarding && !readOnly && <GettingStartedCard onboarding={onboarding} />}

        <div className="mb-6 flex flex-wrap gap-2">
          <LayerBadge layer="talent" size="sm" />
          <LayerBadge layer="interview" size="sm" />
          <LayerBadge layer="decision" size="sm" />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="People in pipeline" value={stats.candidates} icon={Users} tone="teal" />
          <StatCard
            label="Position reviews"
            value={stats.applications}
            icon={Briefcase}
            tone="navy"
            hint="Same person may appear on multiple roles"
          />
          <StatCard
            label="Interviews completed"
            value={stats.interviewed}
            icon={Mic}
            tone="sage"
          />
          <StatCard
            label="Avg. hire confidence"
            value={stats.avgConfidence != null ? formatScore(stats.avgConfidence) : "—"}
            icon={TrendingUp}
            tone="slate"
            hint="Across completed evaluations"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline activity</CardTitle>
            <CardDescription>
              Recent position reviews — click to open campaign intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No pipeline activity yet"
                description={
                  onboarding?.steps.postRole
                    ? "You have open positions — add an applicant to start talent screening for a specific hiring campaign."
                    : "Start by posting an open position, then add applicants linked to that requisition."
                }
                primaryAction={
                  readOnly
                    ? { href: "/admin", label: "Open Platform admin" }
                    : onboarding?.steps.postRole
                      ? { href: "/candidates/new", label: "Add first applicant" }
                      : { href: "/jobs/new", label: "Post open position" }
                }
                secondaryAction={
                  readOnly
                    ? { href: "/candidates", label: "Browse applicants" }
                    : onboarding?.steps.postRole
                      ? { href: "/jobs", label: "View open roles" }
                      : { href: "/candidates/new", label: "Skip to add applicant" }
                }
              />
            ) : (
              <ul>
                {recent.map((app) => (
                  <li key={app.id} className="border-t border-border-subtle first:border-t-0">
                    <Link
                      href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
                    >
                      <Avatar name={app.candidate.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{app.candidate.name}</p>
                        <p className="text-sm text-muted">{app.job.title}</p>
                      </div>
                      <StageBadge stage={app.stage} />
                      {app.decision?.hireConfidence != null ? (
                        <span
                          className={`text-sm font-bold tabular-nums ${scoreColor(app.decision.hireConfidence)}`}
                        >
                          {formatScore(app.decision.hireConfidence)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">
                          {decisionStatusLabel(
                            app.decision?.recommendation,
                            app.decision?.hireConfidence
                          )}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
