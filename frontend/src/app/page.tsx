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
import { getAuthUser, serverFetch } from "@/lib/api-server";
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
  const user = await getAuthUser();
  if (user.isPlatformAdmin) redirect("/admin");

  const applications = await serverFetch<Array<{
    id: string;
    stage: string;
    candidate: { id: string; name: string };
    job: { id: string; title: string };
    talentProfile: { roleFitScore: number | null } | null;
    decision: { hireConfidence: number | null; recommendation: string | null } | null;
  }>>("/api/applications");

  const jobs = await serverFetch<Array<{ id: string }>>("/api/jobs");
  const candidates = await serverFetch<Array<{ id: string }>>("/api/candidates");

  const interviewed = applications.filter(
    (a) => a.stage === "INTERVIEWED" || a.stage === "DECISION" || a.stage === "HIRED"
  ).length;

  const confidences = applications
    .map((a) => a.decision?.hireConfidence)
    .filter((c): c is number => c != null);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null;

  const stats = {
    candidates: candidates.length,
    applications: applications.length,
    jobs: jobs.length,
    interviewed,
    avgConfidence,
  };

  const recent = applications.slice(0, 10);
  const hasJobs = jobs.length > 0;

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
              <EmptyState
                icon={Users}
                title="No pipeline activity yet"
                description={
                  hasJobs
                    ? "You have open positions — add an applicant to start talent screening."
                    : "Start by posting an open position, then add applicants."
                }
                primaryAction={
                  hasJobs
                    ? { href: "/candidates/new", label: "Add first applicant" }
                    : { href: "/jobs/new", label: "Post open position" }
                }
                secondaryAction={
                  hasJobs
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
