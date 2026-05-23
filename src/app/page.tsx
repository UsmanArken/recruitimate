import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ButtonLink } from "@/components/ui/button";
import { requireAuthContext } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard.service";
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

  try {
    const ctx = await requireAuthContext();
    const data = await getDashboardData(ctx);
    stats = data.stats;
    recent = data.recentApplications;
  } catch {
    // DB not connected yet
  }

  return (
    <>
      <PageHeader
        title="Hiring dashboard"
        description="Your team's command center for talent review, interview signals, and hire recommendations."
      >
        <ButtonLink href="/candidates/new">
          <UserPlus className="h-4 w-4" />
          Add candidate
        </ButtonLink>
      </PageHeader>

      <PageBody>
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
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                  <Users className="h-7 w-7 text-brand" />
                </div>
                <p className="font-medium text-foreground">No applications in your pipeline yet</p>
                <p className="mt-1 text-sm text-muted">
                  Add a candidate linked to an open position to start screening.
                </p>
                <ButtonLink href="/candidates/new" className="mt-5">
                  Add first candidate
                </ButtonLink>
              </div>
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
