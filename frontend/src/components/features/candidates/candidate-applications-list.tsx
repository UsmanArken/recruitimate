"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { formatScore, scoreColor } from "@/lib/utils";
import { StageBadge } from "@/components/features/candidates/stage-badge";

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

type Application = {
  id: string;
  stage: string;
  jobId: string;
  job: { id: string; title: string } | null;
  talentProfile: { roleFitScore: number | null } | null;
  decision: { recommendation: string | null } | null;
  hireReviewVerdict: string | null;
};

export function CandidateApplicationsList({
  candidateId,
  initialApplications,
}: {
  candidateId: string;
  initialApplications: Application[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(app: Application, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Remove this candidate from "${app.job?.title ?? "this role"}"? All interviews and analysis for this application will be deleted.`)) return;
    setDeletingId(app.id);
    try {
      await apiFetch(`/api/applications/${app.id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      router.refresh();
    } catch {
      // silent — keep UI state, user can retry
    } finally {
      setDeletingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <p className="px-6 py-8 text-sm text-muted">
        No positions linked yet. Apply this person to an open position below.
      </p>
    );
  }

  return (
    <ul>
      {applications.map((app) => (
        <li key={app.id} className="group border-t border-border-subtle first:border-t-0">
          <div className="flex items-center">
            <Link
              href={`/candidates/${candidateId}/applications/${app.id}`}
              className="flex flex-1 flex-wrap items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
            >
              <Briefcase className="h-5 w-5 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{app.job?.title ?? "Unknown role"}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-sm font-bold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}>
                  {formatScore(app.talentProfile?.roleFitScore)}
                </span>
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
              <StageBadge stage={app.stage} />
            </Link>
            <button
              type="button"
              onClick={(e) => handleDelete(app, e)}
              disabled={deletingId === app.id}
              title="Remove from this role"
              className="mr-4 rounded-md p-1.5 text-muted opacity-0 transition hover:bg-risk-bg hover:text-risk group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
