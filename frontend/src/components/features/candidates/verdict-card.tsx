"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, HelpCircle, Mic2, TrendingUp, TrendingDown } from "lucide-react";
import { cn, scoreColor } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
  applicationId: string;
  stage: string;
  recommendation: string | null;
  roleFitScore: number | null;
  explanation: string | null;
  reasonsToHire: string[];
  reasonsToReject: string[];
  hasInterview: boolean;
}

const REC_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  HIRE:        { label: "Recommend hire",    icon: CheckCircle2, className: "bg-success text-white" },
  LEAN_HIRE:   { label: "Lean hire",         icon: TrendingUp,   className: "bg-success/70 text-white" },
  HOLD:        { label: "Hold for review",   icon: HelpCircle,   className: "bg-warning text-white" },
  LEAN_REJECT: { label: "Lean reject",       icon: TrendingDown, className: "bg-risk/70 text-white" },
  REJECT:      { label: "Not recommended",   icon: XCircle,      className: "bg-risk text-white" },
};

export function VerdictCard({
  applicationId,
  stage,
  recommendation,
  roleFitScore,
  explanation,
  reasonsToHire,
  reasonsToReject,
  hasInterview,
}: Props) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(stage);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);

  async function updateStage(newStage: string) {
    const prevStage = currentStage;
    setLoadingStage(newStage);
    setCurrentStage(newStage);
    try {
      await apiFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ stage: newStage }),
      });
      router.refresh();
    } catch {
      setCurrentStage(prevStage);
    } finally {
      setLoadingStage(null);
    }
  }

  const rec = recommendation ? (REC_CONFIG[recommendation] ?? {
    label: recommendation.replace(/_/g, " "),
    icon: HelpCircle,
    className: "bg-muted text-foreground",
  }) : null;
  const RecIcon = rec?.icon ?? HelpCircle;
  const fitPct = roleFitScore != null ? Math.round(Math.min(100, Math.max(0, roleFitScore))) : null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Recommendation pill */}
      {rec ? (
        <div className={cn("flex items-center gap-2.5 rounded-t-xl px-5 py-3.5", rec.className)}>
          <RecIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-bold tracking-wide">{rec.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-t-xl bg-background px-5 py-3.5">
          <Mic2 className="h-4 w-4 text-interview" />
          <span className="text-sm font-semibold text-muted">
            {hasInterview ? "Analysis pending" : "Interview required"}
          </span>
        </div>
      )}

      <div className="space-y-4 px-5 py-4">
        {/* Role fit score */}
        {fitPct != null && (
          <div className="rounded-lg border border-border-subtle bg-background px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Role fit</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", scoreColor(fitPct))}>
              {fitPct}%
            </p>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <p className="text-xs leading-relaxed text-muted italic">{explanation}</p>
        )}

        {/* Reasons to hire */}
        {reasonsToHire.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-success">
              Reasons to hire
            </p>
            <ul className="space-y-1">
              {reasonsToHire.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasons to reject */}
        {reasonsToReject.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-risk">
              Reasons to reject
            </p>
            <ul className="space-y-1">
              {reasonsToReject.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-risk" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-border-subtle" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loadingStage !== null || currentStage === "SHORTLISTED"}
            onClick={() => updateStage("SHORTLISTED")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition",
              currentStage === "SHORTLISTED"
                ? "bg-success/10 text-success ring-1 ring-success/30 cursor-default"
                : "bg-success text-white hover:bg-success/90 disabled:opacity-50"
            )}
          >
            {loadingStage === "SHORTLISTED" ? "…" : currentStage === "SHORTLISTED" ? "Shortlisted" : "Shortlist"}
          </button>
          <button
            type="button"
            disabled={loadingStage !== null || currentStage === "REJECTED"}
            onClick={() => updateStage("REJECTED")}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition",
              currentStage === "REJECTED"
                ? "bg-risk/10 text-risk ring-1 ring-risk/30 cursor-default"
                : "bg-risk/10 text-risk ring-1 ring-risk/20 hover:bg-risk/20 disabled:opacity-50"
            )}
          >
            {loadingStage === "REJECTED" ? "…" : currentStage === "REJECTED" ? "Rejected" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
