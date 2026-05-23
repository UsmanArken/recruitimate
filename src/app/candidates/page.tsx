import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { listApplications } from "@/lib/services/application.service";
import { listJobs } from "@/lib/services/job.service";
import { formatScore, scoreColor } from "@/lib/utils";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
  let jobCount = 0;
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    const [apps, jobs] = await Promise.all([listApplications(ctx), listJobs(ctx)]);
    applications = apps;
    jobCount = jobs.length;
  } catch {
    // DB not ready
  }

  const hasRoles = jobCount > 0;

  return (
    <>
      <PageHeader
        title="Candidates"
        description="One applicant can be in review for multiple open positions — each row is a separate hiring campaign."
      >
        {!readOnly && (
          <ButtonLink href={hasRoles ? "/candidates/new" : "/jobs/new"}>
            <UserPlus className="h-4 w-4" />
            {hasRoles ? "Add candidate" : "Post open position"}
          </ButtonLink>
        )}
      </PageHeader>

      <PageBody>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-0">
              <EmptyState
                icon={Users}
                title="No applicants in review yet"
                description={
                  hasRoles
                    ? "Add someone to an open position to run resume screening, role fit, and interview intelligence for that campaign."
                    : "Post an open position first — applicants are always evaluated against a specific hiring campaign."
                }
                primaryAction={
                  readOnly
                    ? { href: "/admin", label: "Open Platform admin" }
                    : hasRoles
                      ? { href: "/candidates/new", label: "Add first applicant" }
                      : { href: "/jobs/new", label: "Post open position" }
                }
                secondaryAction={
                  readOnly
                    ? undefined
                    : hasRoles
                      ? { href: "/jobs", label: "View open roles" }
                      : { href: "/", label: "See getting started guide" }
                }
              />
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
