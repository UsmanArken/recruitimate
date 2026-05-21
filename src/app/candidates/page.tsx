import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { listCandidates } from "@/lib/services/candidate.service";
import { formatScore, scoreColor } from "@/lib/utils";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  let candidates: Awaited<ReturnType<typeof listCandidates>> = [];

  try {
    const ctx = await requireAuthContext();
    candidates = await listCandidates(ctx);
  } catch {
    // DB not ready
  }

  return (
    <>
      <PageHeader
        title="Candidates"
        description="Your talent pool with pre-interview fit scores and hire confidence — built for recruiter workflows."
      >
        <ButtonLink href="/candidates/new">
          <UserPlus className="h-4 w-4" />
          Add candidate
        </ButtonLink>
      </PageHeader>

      <PageBody>
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="mx-auto h-10 w-10 text-muted/50" />
              <p className="mt-4 font-medium">No candidates yet</p>
              <p className="mt-1 text-sm text-muted">
                Import your first applicant to run talent intelligence.
              </p>
              <ButtonLink href="/candidates/new" className="mt-6">
                Add candidate
              </ButtonLink>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="table-hr w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Pipeline stage</th>
                  <th className="px-5 py-3.5">Role fit</th>
                  <th className="px-5 py-3.5">Hire confidence</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="flex items-center gap-3 font-semibold text-foreground hover:text-primary"
                      >
                        <Avatar name={c.name} size="sm" />
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted">{c.job?.title ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StageBadge stage={c.stage} />
                    </td>
                    <td
                      className={`px-5 py-4 font-semibold tabular-nums ${scoreColor(c.talentProfile?.roleFitScore)}`}
                    >
                      {formatScore(c.talentProfile?.roleFitScore)}
                    </td>
                    <td
                      className={`px-5 py-4 font-semibold tabular-nums ${scoreColor(c.decision?.hireConfidence)}`}
                    >
                      {formatScore(c.decision?.hireConfidence)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageBody>
    </>
  );
}
