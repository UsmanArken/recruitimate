import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getHiringAnalytics } from "@/lib/services/analytics.service";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BarChart3,
  Clock,
  Scale,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

function pct(value: number | null | undefined): string {
  return value != null ? `${Math.round(value * 100)}%` : "—";
}

function Bar({ value, max, tone = "bg-primary" }: { value: number; max: number; tone?: string }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-background">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const ctx = await requireAuthContext();
  if (isPlatformReadOnlyWorkspace(ctx)) redirect("/admin");

  const data = await getHiringAnalytics(ctx);
  const { overview, funnel, outcomeCounts, timeToHire, recommendationAccuracy, fairness } = data;

  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));
  const hasData = overview.applications > 0;

  return (
    <>
      <PageHeader
        title="Hiring analytics"
        description="Team-level pipeline health, time-to-hire, decision quality, and interview fairness."
      />

      <PageBody>
        {!hasData ? (
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Add candidates, run interviews, and record outcomes to populate org-level hiring metrics."
            primaryAction={{ href: "/candidates/new", label: "Add candidate" }}
          />
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="People in pipeline" value={overview.candidates} icon={Users} tone="teal" />
              <StatCard
                label="Avg. hire confidence"
                value={pct(overview.avgConfidence)}
                icon={TrendingUp}
                tone="navy"
              />
              <StatCard
                label="Good-hire rate"
                value={pct(overview.goodHireRate)}
                icon={Target}
                tone="sage"
                hint={`${overview.outcomesRecorded} outcomes recorded`}
              />
              <StatCard
                label="Median time-to-hire"
                value={timeToHire.medianDays != null ? `${timeToHire.medianDays}d` : "—"}
                icon={Clock}
                tone="slate"
                hint={timeToHire.count > 0 ? `${timeToHire.count} hires measured` : "No hires yet"}
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Pipeline funnel
                  </CardTitle>
                  <CardDescription>Applications by current stage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {funnel.map((row) => (
                    <div key={row.stage}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium">{row.label}</span>
                        <span className="tabular-nums text-muted">{row.count}</span>
                      </div>
                      <Bar value={row.count} max={funnelMax} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Decision quality
                  </CardTitle>
                  <CardDescription>How outcomes and recommendations line up</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Hired</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{outcomeCounts.HIRED}</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Rejected</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{outcomeCounts.REJECTED}</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Withdrew</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">{outcomeCounts.WITHDRAWN}</p>
                    </div>
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Offer declined</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums">
                        {outcomeCounts.OFFER_DECLINED}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">Recommendation accuracy</span>
                      <span className="tabular-nums text-muted">
                        {pct(recommendationAccuracy.accuracy)}
                      </span>
                    </div>
                    <Bar value={recommendationAccuracy.accuracy ?? 0} max={1} tone="bg-success" />
                    <p className="mt-1 text-xs text-muted">
                      {recommendationAccuracy.evaluated > 0
                        ? `${recommendationAccuracy.correct}/${recommendationAccuracy.evaluated} directional recommendations matched the eventual outcome.`
                        : "Record more outcomes on interviewed candidates to measure accuracy."}
                    </p>
                  </div>
                  {timeToHire.averageDays != null && (
                    <p className="text-xs text-muted">
                      Time-to-hire — avg {timeToHire.averageDays}d · fastest {timeToHire.fastestDays}d ·
                      slowest {timeToHire.slowestDays}d
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Bias &amp; fairness
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    P3-006
                  </span>
                </CardTitle>
                <CardDescription>
                  Advisory interviewer-bias indicators aggregated across {fairness.interviewsAnalyzed}{" "}
                  analyzed interviews. Patterns, not accusations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fairness.interviewsAnalyzed === 0 ? (
                  <p className="text-sm text-muted">
                    No analyzed interviews yet. Interviewer quality and bias signals appear here once
                    interviews are recorded.
                  </p>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted">
                          Avg. bias risk (lower is better)
                        </p>
                        <p className="mt-1 text-3xl font-bold tabular-nums">
                          {pct(fairness.averageBiasRisk)}
                        </p>
                        <Bar value={fairness.averageBiasRisk ?? 0} max={1} tone="bg-warning" />
                      </div>
                      <p className="text-xs text-muted">
                        {fairness.interviewsWithBiasFlags} of {fairness.interviewsAnalyzed} interviews
                        raised at least one advisory bias flag.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wide text-muted">Risk distribution</p>
                      {(["high", "medium", "low"] as const).map((bucket) => (
                        <div key={bucket}>
                          <div className="mb-1 flex items-center justify-between text-sm capitalize">
                            <span>{bucket} risk</span>
                            <span className="tabular-nums text-muted">
                              {fairness.riskBuckets[bucket]}
                            </span>
                          </div>
                          <Bar
                            value={fairness.riskBuckets[bucket]}
                            max={Math.max(1, fairness.interviewsAnalyzed)}
                            tone={
                              bucket === "high"
                                ? "bg-warning"
                                : bucket === "medium"
                                  ? "bg-talent"
                                  : "bg-success"
                            }
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted">
                        Coverage {pct(fairness.averageCoverage)} · Probing {pct(fairness.averageProbing)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                        Most common flags
                      </p>
                      {fairness.topBiasFlags.length === 0 ? (
                        <p className="text-sm text-success">No recurring bias flags detected.</p>
                      ) : (
                        <ul className="space-y-2">
                          {fairness.topBiasFlags.map((flag) => (
                            <li
                              key={flag.label}
                              className="flex items-center justify-between gap-3 rounded-lg bg-warning-bg/50 px-3 py-2 text-sm"
                            >
                              <span className="text-foreground/90">{flag.label}</span>
                              <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-muted ring-1 ring-border">
                                {flag.count}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </PageBody>
    </>
  );
}
