import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/layer-badge";
import { PageHeader, PageBody } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/ui/button";
import { formatScore, scoreColor } from "@/lib/utils";
import { Users, Briefcase, Mic, TrendingUp, ArrowRight, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats = { candidates: 0, jobs: 0, interviewed: 0, avgConfidence: null as number | null };
  let recent = [] as Array<{
    id: string;
    name: string;
    stage: string;
    job: { title: string } | null;
    decision: { hireConfidence: number | null } | null;
  }>;

  try {
    const [candidateCount, jobCount, interviewedCount, decisions, recentCandidates] =
      await Promise.all([
        db.candidate.count(),
        db.job.count(),
        db.candidate.count({ where: { stage: "INTERVIEWED" } }),
        db.decision.findMany({ where: { hireConfidence: { not: null } } }),
        db.candidate.findMany({
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: { job: true, decision: true, talentProfile: true },
        }),
      ]);

    const avg =
      decisions.length > 0
        ? decisions.reduce((s, d) => s + (d.hireConfidence ?? 0), 0) / decisions.length
        : null;

    stats = {
      candidates: candidateCount,
      jobs: jobCount,
      interviewed: interviewedCount,
      avgConfidence: avg,
    };
    recent = recentCandidates;
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
          <StatCard label="Active candidates" value={stats.candidates} icon={Users} tone="teal" />
          <StatCard label="Open roles" value={stats.jobs} icon={Briefcase} tone="navy" />
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
            hint="Across evaluated candidates"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline activity</CardTitle>
            <CardDescription>
              Recent candidates across your hiring funnel — click to view full intelligence profile
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                  <Users className="h-7 w-7 text-brand" />
                </div>
                <p className="font-medium text-foreground">No candidates in your pipeline yet</p>
                <p className="mt-1 text-sm text-muted">
                  Add a candidate to start talent and decision intelligence.
                </p>
                <ButtonLink href="/candidates/new" className="mt-5">
                  Add first candidate
                </ButtonLink>
              </div>
            ) : (
              <ul>
                {recent.map((c) => (
                  <li key={c.id} className="border-t border-border-subtle first:border-t-0">
                    <Link
                      href={`/candidates/${c.id}`}
                      className="flex items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
                    >
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-sm text-muted">
                          {c.job?.title ?? "Unassigned role"}
                        </p>
                      </div>
                      <StageBadge stage={c.stage} />
                      {c.decision?.hireConfidence != null && (
                        <span
                          className={`text-sm font-bold tabular-nums ${scoreColor(c.decision.hireConfidence)}`}
                        >
                          {formatScore(c.decision.hireConfidence)}
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
