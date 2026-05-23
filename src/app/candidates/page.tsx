import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { listApplications } from "@/lib/services/application.service";
import { formatScore, scoreColor } from "@/lib/utils";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";

function decisionStatusLabel(
  recommendation: string | null | undefined,
  hireConfidence: number | null | undefined
): string {
  if (recommendation === "pending_role") return "Needs open position";
  if (recommendation === "pending_interview") return "Awaiting interview";
  if (hireConfidence != null) return `${Math.round(hireConfidence * 100)}% confidence`;
  return "—";
}

export default async function CandidatesPage() {
  let applications: Awaited<ReturnType<typeof listApplications>> = [];

  try {
    const ctx = await requireAuthContext();
    applications = await listApplications(ctx);
  } catch {
    // DB not ready
  }

  return (
    <>
      <PageHeader
        title="Candidates"
        description="One applicant can be in review for multiple open positions — each row is a separate hiring campaign."
      >
        <ButtonLink href="/candidates/new">
          <UserPlus className="h-4 w-4" />
          Add candidate
        </ButtonLink>
      </PageHeader>

      <PageBody>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="mx-auto h-10 w-10 text-muted/50" />
              <p className="mt-4 font-medium">No applications yet</p>
              <p className="mt-1 text-sm text-muted">
                Import an applicant and link them to an open position to start screening.
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
                  <th className="px-5 py-3.5">Open position</th>
                  <th className="px-5 py-3.5">Pipeline stage</th>
                  <th className="px-5 py-3.5">Role fit</th>
                  <th className="px-5 py-3.5">Decision status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/candidates/${app.candidate.id}`}
                        className="flex items-center gap-3 font-semibold text-foreground hover:text-primary"
                      >
                        <Avatar name={app.candidate.name} size="sm" />
                        {app.candidate.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                        className="font-medium text-brand hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StageBadge stage={app.stage} />
                    </td>
                    <td
                      className={`px-5 py-4 font-semibold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}
                    >
                      {formatScore(app.talentProfile?.roleFitScore)}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {decisionStatusLabel(
                        app.decision?.recommendation,
                        app.decision?.hireConfidence
                      )}
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
