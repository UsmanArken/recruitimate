"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, HelpCircle, Mic2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

interface Props {
  applicationId: string;
  stage: string;
  recommendation: string | null;
  explanation: string | null;
  reasonsToHire: string[];
  reasonsToReject: string[];
  hasInterview: boolean;
}

const REC_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; banner: string; dot: string }> = {
  HIRE:        { label: "Recommend hire",  icon: CheckCircle2, banner: "bg-success text-white",    dot: "bg-white/80" },
  LEAN_HIRE:   { label: "Lean hire",       icon: TrendingUp,   banner: "bg-success/80 text-white", dot: "bg-white/80" },
  HOLD:        { label: "Hold for review", icon: HelpCircle,   banner: "bg-warning text-white",    dot: "bg-white/80" },
  LEAN_REJECT: { label: "Lean reject",     icon: TrendingDown, banner: "bg-risk/80 text-white",    dot: "bg-white/80" },
  REJECT:      { label: "Not recommended", icon: XCircle,      banner: "bg-risk text-white",       dot: "bg-white/80" },
};

export function VerdictCard({
  applicationId,
  stage,
  recommendation,
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

  const rec = recommendation
    ? (REC_CONFIG[recommendation] ?? {
        label: recommendation.replace(/_/g, " "),
        icon: HelpCircle,
        banner: "bg-muted/40 text-foreground",
        dot: "bg-foreground/40",
      })
    : null;
  const RecIcon = rec?.icon ?? HelpCircle;
  const hasReasons = reasonsToHire.length > 0 || reasonsToReject.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

      {/* ── Recommendation banner ──────────────────────────────── */}
      {rec ? (
        <div className={cn("flex items-center gap-2.5 px-5 py-4", rec.banner)}>
          <RecIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-bold tracking-wide">{rec.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-border-subtle bg-background px-5 py-4">
          <Mic2 className="h-4 w-4 text-interview" />
          <span className="text-sm font-semibold text-muted">
            {hasInterview ? "Analysis pending" : "Interview required"}
          </span>
        </div>
      )}

      <div className="space-y-4 px-5 py-4">

        {/* ── Explanation ─────────────────────────────────────── */}
        {explanation && (
          <p className="border-l-2 border-border-subtle pl-3 text-xs italic leading-relaxed text-muted">
            {explanation}
          </p>
        )}

        {/* ── For / Against two-column grid ───────────────────── */}
        {hasReasons && (
          <div className="grid grid-cols-2 gap-2">
            {/* For */}
            <div className="rounded-lg bg-success/[0.06] p-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-success">For</p>
              {reasonsToHire.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {reasonsToHire.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs leading-snug text-foreground/80">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success/60" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted/50 italic">None noted</p>
              )}
            </div>

            {/* Against */}
            <div className="rounded-lg bg-risk/[0.06] p-3">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-risk">Against</p>
              {reasonsToReject.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {reasonsToReject.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs leading-snug text-foreground/80">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-risk/60" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted/50 italic">None noted</p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border-subtle" />

        {/* ── Stage actions ────────────────────────────────────── */}
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
            {loadingStage === "SHORTLISTED" ? "…" : currentStage === "SHORTLISTED" ? "Shortlisted ✓" : "Shortlist"}
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
