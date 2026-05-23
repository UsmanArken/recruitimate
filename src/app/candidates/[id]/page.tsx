import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getCandidateById } from "@/lib/services/candidate.service";
import { listJobs } from "@/lib/services/job.service";
import { formatScore, scoreColor } from "@/lib/utils";
import { PageBody } from "@/components/layout/page-header";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { ApplyToPosition } from "@/components/features/candidates/apply-to-position";
import { CandidateNotesPanel } from "@/components/features/candidates/candidate-notes-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Mail, Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

function decisionStatusLabel(
  recommendation: string | null | undefined,
  hireConfidence: number | null | undefined
): string {
  if (recommendation === "pending_interview") return "Awaiting interview";
  if (hireConfidence != null) return `${Math.round(hireConfidence * 100)}% confidence`;
  return "—";
}

export default async function CandidatePersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let candidate: Awaited<ReturnType<typeof getCandidateById>> | null = null;
  let openJobs: { id: string; title: string }[] = [];
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    const [candidateRow, jobRows] = await Promise.all([
      getCandidateById(ctx, id),
      listJobs(ctx),
    ]);
    candidate = candidateRow;
    openJobs = jobRows.map((j) => ({ id: j.id, title: j.title }));
  } catch {
    notFound();
  }

  if (!candidate) notFound();

  const appliedJobIds = candidate.applications.map((a) => a.jobId);
  const notesForPanel = candidate.notes.map((n) => ({
    id: n.id,
    content: n.content,
    tags: n.tags,
    createdAt: n.createdAt.toISOString(),
    author: n.author,
  }));

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-6">
        <Link
          href="/candidates"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to candidates
        </Link>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={candidate.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
            {candidate.email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              One resume, multiple hiring campaigns. Each open position has its own role fit,
              interviews, and hire recommendation.
            </p>
          </div>
        </div>
      </div>

      <PageBody>
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open position reviews</CardTitle>
              <CardDescription>
                Select a campaign to view talent screening, interviews, and decision intelligence
                for that requisition.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {candidate.applications.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted">
                  No positions linked yet. Apply this person to an open position below.
                </p>
              ) : (
                <ul>
                  {candidate.applications.map((app) => (
                    <li
                      key={app.id}
                      className="border-t border-border-subtle first:border-t-0"
                    >
                      <Link
                        href={`/candidates/${candidate.id}/applications/${app.id}`}
                        className="flex flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
                      >
                        <Briefcase className="h-5 w-5 text-brand" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">{app.job.title}</p>
                          <p className="text-sm text-muted">
                            {decisionStatusLabel(
                              app.decision?.recommendation,
                              app.decision?.hireConfidence
                            )}
                          </p>
                        </div>
                        <StageBadge stage={app.stage} />
                        <span
                          className={`text-sm font-bold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}
                        >
                          {formatScore(app.talentProfile?.roleFitScore)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <CandidateNotesPanel
            candidateId={candidate.id}
            initialNotes={notesForPanel}
            readOnly={readOnly}
          />
        </section>

        {!readOnly && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apply to another position</CardTitle>
                <CardDescription>
                  Reuse the same resume for a different hiring campaign — role fit and decisions
                  are computed per position.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplyToPosition
                  candidateId={candidate.id}
                  excludeJobIds={appliedJobIds}
                  initialJobs={openJobs}
                />
              </CardContent>
            </Card>
          </section>
        )}
      </PageBody>
    </>
  );
}
