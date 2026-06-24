import Link from "next/link";
import { Avatar } from "@/components/features/candidates/avatar";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatScore, scoreColor } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";

export type JobPipelineRow = {
  id: string;
  stage: string;
  candidate: { id: string; name: string; email: string | null };
  talentProfile: { roleFitScore: number | null } | null;
  decision: { recommendation: string | null } | null;
  hireReviewVerdict: string | null;
};

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

export function JobPipelineTable({
  applications,
}: {
  applications: JobPipelineRow[];
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applicants yet"
        description="Bulk upload resumes above or add candidates one by one — they'll appear here ranked by role fit."
        primaryAction={{ href: "/candidates/new", label: "Add single applicant" }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border-subtle bg-gradient-to-r from-talent-bg/40 to-transparent px-5 py-3">
        <p className="text-sm font-semibold text-foreground">Applicant pipeline</p>
        <p className="text-xs text-muted">Sorted by role fit — highest first</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table-hr w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5 w-12">#</th>
              <th className="px-5 py-3.5">Candidate</th>
              <th className="px-5 py-3.5">Stage</th>
              <th className="px-5 py-3.5">Role fit</th>
              <th className="px-5 py-3.5">AI recommendation</th>
              <th className="px-5 py-3.5">Recruiter decision</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={app.id}>
                <td className="px-5 py-4 text-xs font-bold tabular-nums text-muted">{index + 1}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                    className="flex items-center gap-3 font-semibold text-foreground hover:text-primary"
                  >
                    <Avatar name={app.candidate.name} size="sm" />
                    <span>{app.candidate.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <StageBadge stage={app.stage} />
                </td>
                <td
                  className={`px-5 py-4 text-base font-bold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}
                >
                  {formatScore(app.talentProfile?.roleFitScore)}
                </td>
                <td className="px-5 py-4">
                  {app.decision?.recommendation && AI_REC_LABELS[app.decision.recommendation] ? (
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${AI_REC_LABELS[app.decision.recommendation].cls}`}>
                      {AI_REC_LABELS[app.decision.recommendation].label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {app.hireReviewVerdict && RECRUITER_VERDICT_LABELS[app.hireReviewVerdict] ? (
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${RECRUITER_VERDICT_LABELS[app.hireReviewVerdict].cls}`}>
                      {RECRUITER_VERDICT_LABELS[app.hireReviewVerdict].label}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
