import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/layer-badge";
import { formatScore } from "@/lib/utils";
import { ArrowRight, Users, Briefcase, Mic } from "lucide-react";

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
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Hiring Intelligence</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Signal-based hiring across three layers — talent, interview, and decision intelligence.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <LayerBadge layer="talent" />
        <LayerBadge layer="interview" />
        <LayerBadge layer="decision" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Candidates", value: stats.candidates, icon: Users },
          { label: "Open jobs", value: stats.jobs, icon: Briefcase },
          { label: "Interviewed", value: stats.interviewed, icon: Mic },
          {
            label: "Avg hire confidence",
            value: stats.avgConfidence != null ? formatScore(stats.avgConfidence) : "—",
            icon: null,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between pt-5">
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
              {Icon && <Icon className="h-8 w-8 text-muted/40" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent candidates</CardTitle>
          <CardDescription>Latest activity across the hiring pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted">No candidates yet.</p>
              <Link
                href="/candidates/new"
                className="mt-3 inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                Add your first candidate →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/candidates/${c.id}`}
                    className="flex items-center justify-between py-3 transition hover:bg-muted/20 -mx-2 px-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted">
                        {c.job?.title ?? "Unassigned"} · {c.stage.replace(/_/g, " ").toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.decision?.hireConfidence != null && (
                        <span className="text-sm tabular-nums">
                          {formatScore(c.decision.hireConfidence)}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
