import Link from "next/link";
import { db } from "@/lib/db";
import { formatScore } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  let candidates = [] as Awaited<
    ReturnType<
      typeof db.candidate.findMany<{
        include: { job: true; talentProfile: true; decision: true };
      }>
    >
  >;

  try {
    candidates = await db.candidate.findMany({
      include: { job: true, talentProfile: true, decision: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB not ready
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-muted">3-layer intelligence profiles</p>
        </div>
        <Link
          href="/candidates/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted">
            No candidates yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Fit</th>
                <th className="px-4 py-3 font-medium">Hire confidence</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.job?.title ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {c.stage.replace(/_/g, " ").toLowerCase()}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatScore(c.talentProfile?.roleFitScore)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatScore(c.decision?.hireConfidence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
