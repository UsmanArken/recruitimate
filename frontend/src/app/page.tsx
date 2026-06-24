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
import { GettingStartedCard } from "@/components/features/onboarding/getting-started-card";
import { ArrowRight, Users, Briefcase, Mic } from "lucide-react";

export const dynamic = "force-dynamic";

const AI_REC_LABELS: Record<string, { label: string; cls: string }> = {
  HIRE:        { label: "Hire",        cls: "bg-success-bg text-success" },
  LEAN_HIRE:   { label: "Lean hire",   cls: "bg-success-bg text-success" },
  HOLD:        { label: "Hold",        cls: "bg-warning-bg text-warning" },
  LEAN_REJECT: { label: "Lean reject", cls: "bg-risk-bg text-risk" },
  REJECT:      { label: "Reject",      cls: "bg-risk-bg text-risk" },
};

const RECRUITER_VERDICT_LABELS: Record<string, { label: string; cls: string }> = {
  PASS: { label: "Pass", cls: "bg-success-bg text-success" },
  HOLD: { label: "Hold", cls: "bg-warning-bg text-warning" },
  FAIL: { label: "Fail", cls: "bg-risk-bg text-risk" },
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (user.isPlatformAdmin) redirect("/admin");

  const applications = await serverFetch<Array<{
    id: string;
    stage: string;
    candidate: { id: string; name: string };
    job: { id: string; title: string };
    talentProfile: { roleFitScore: number | null } | null;
    decision: { recommendation: string | null } | null;
    hireReviewVerdict: string | null;
  }>>("/api/applications");

  const jobs = await serverFetch<Array<{ id: string; title: string }>>("/api/jobs");
  const candidates = await serverFetch<Array<{ id: string }>>("/api/candidates");

  const interviewed = applications.filter(
    (a) => a.stage === "INTERVIEWED" || a.stage === "DECISION" || a.stage === "HIRED"
  ).length;

  const stats = {
    candidates: candidates.length,
    applications: applications.length,
    jobs: jobs.length,
    interviewed,
  };

  const recent = applications.slice(0, 10);

  return (
    <>
      <PageHeader
        title="Hiring dashboard"
        description="Your team's command center for talent review, interview signals, and hire recommendations."
      >
        <ButtonLink href="/jobs/new">
          <Briefcase className="h-4 w-4" />
          Post open role
        </ButtonLink>
      </PageHeader>

      <PageBody>
        <GettingStartedCard
          hasRole={stats.jobs > 0}
          hasCandidate={stats.candidates > 0}
          hasInterview={stats.interviewed > 0}
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <LayerBadge layer="talent" size="sm" />
          <LayerBadge layer="interview" size="sm" />
          <LayerBadge layer="decision" size="sm" />
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Open roles</CardTitle>
              <CardDescription>
                Start from your hiring campaigns — add applicants or bulk-upload CVs per role.
              </CardDescription>
            </div>
            <ButtonLink href="/jobs/new" className="shrink-0">
              Post role
            </ButtonLink>
          </CardHeader>
          <CardContent className="p-0">
            {jobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No open roles yet"
                description="Post a requisition first. Role-fit scoring and pipeline views are organized by open position."
                primaryAction={{ href: "/jobs/new", label: "Post your first role" }}
              />
            ) : (
              <ul>
                {jobs.slice(0, 5).map((job) => (
                  <li key={job.id} className="border-t border-border-subtle first:border-t-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
                    >
                      <Briefcase className="h-5 w-5 text-brand" />
                      <p className="min-w-0 flex-1 font-semibold text-foreground">{job.title}</p>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open roles" value={stats.jobs} icon={Briefcase} tone="navy" />
          <StatCard label="People in pipeline" value={stats.candidates} icon={Users} tone="teal" />
          <StatCard
            label="Position reviews"
            value={stats.applications}
            icon={Users}
            tone="sage"
            hint="Same person may appear on multiple roles"
          />
          <StatCard
            label="Interviews completed"
            value={stats.interviewed}
            icon={Mic}
            tone="slate"
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
                  jobs.length > 0
                    ? "You have open positions — add an applicant to start talent screening."
                    : "Start by posting an open position, then add applicants."
                }
                primaryAction={
                  jobs.length > 0
                    ? { href: "/candidates/new", label: "Add first applicant" }
                    : { href: "/jobs/new", label: "Post open position" }
                }
                secondaryAction={
                  jobs.length > 0
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
                      <div className="flex items-center gap-1.5">
                        {app.decision?.recommendation && AI_REC_LABELS[app.decision.recommendation] ? (
                          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${AI_REC_LABELS[app.decision.recommendation].cls}`}>
                            {AI_REC_LABELS[app.decision.recommendation].label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Awaiting analysis</span>
                        )}
                        {app.hireReviewVerdict && RECRUITER_VERDICT_LABELS[app.hireReviewVerdict] && (
                          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${RECRUITER_VERDICT_LABELS[app.hireReviewVerdict].cls}`}>
                            {RECRUITER_VERDICT_LABELS[app.hireReviewVerdict].label}
                          </span>
                        )}
                      </div>
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
