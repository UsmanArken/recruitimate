"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, HelpCircle, Mic2, ChevronDown, ChevronUp } from "lucide-react";
import { cn, scoreColor, scoreBarColor } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";

interface SignalBreakdown {
  technicalFit?: string | null;
  communication?: string | null;
  culturalFit?: string | null;
  reliability?: string | null;
  crossSignalConsistency?: number | null;
  inconsistencies?: string[] | null;
  inconsistenciesExplanation?: string | null;
}

interface Props {
  applicationId: string;
  stage: string;
  hireConfidence: number | null;
  recommendation: string | null;
  roleFitScore: number | null;
  riskFactors: string[];
  explanation: string | null;
  signalBreakdown: SignalBreakdown | null;
  hasInterview: boolean;
}

const REC_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  HIRE:   { label: "Recommend hire",   icon: CheckCircle2, className: "bg-success text-white" },
  HOLD:   { label: "Hold for review",  icon: HelpCircle,   className: "bg-warning text-white" },
  REJECT: { label: "Not recommended",  icon: XCircle,      className: "bg-risk text-white" },
};

function signalPillClass(val: string): string {
  const lower = val.toLowerCase();
  if (lower === "strong") return "bg-success/10 text-success";
  if (lower === "moderate") return "bg-warning/15 text-warning";
  if (lower === "weak") return "bg-risk/10 text-risk";
  return "bg-muted/40 text-muted-foreground";
}

const BREAKDOWN_LABELS: Record<string, string> = {
  technicalFit: "Technical fit",
  communication: "Communication",
  culturalFit: "Culture fit",
  reliability: "Reliability",
};

export function VerdictCard({
  applicationId,
  stage,
  hireConfidence,
  recommendation,
  roleFitScore,
  riskFactors,
  explanation,
  signalBreakdown,
  hasInterview,
}: Props) {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(stage);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [showRisk, setShowRisk] = useState(false);

  async function updateStage(newStage: string) {
    const prevStage = currentStage;
    setLoadingStage(newStage);
    setCurrentStage(newStage); // optimistic
    try {
      await apiFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ stage: newStage }),
      });
      router.refresh();
    } catch {
      setCurrentStage(prevStage); // revert to actual last state
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

  const confPct = hireConfidence != null ? Math.round(Math.min(100, Math.max(0, hireConfidence))) : null;
  const fitPct = roleFitScore != null ? Math.round(Math.min(100, Math.max(0, roleFitScore))) : null;

  const breakdownEntries = signalBreakdown
    ? Object.entries(BREAKDOWN_LABELS)
        .map(([key, label]) => ({ key, label, val: (signalBreakdown as Record<string, unknown>)[key] as string | null | undefined }))
        .filter((e) => e.val)
    : [];
  const consistency = signalBreakdown?.crossSignalConsistency;
  const inconsistencies = signalBreakdown?.inconsistencies ?? [];

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
        {/* Score row */}
        <div className="grid grid-cols-2 gap-3">
          <MiniScore label="Hire confidence" value={confPct} invert={false} />
          <MiniScore label="Role fit" value={fitPct} invert={false} />
        </div>

        {/* Explanation */}
        {explanation && (
          <p className="text-xs leading-relaxed text-muted">{explanation}</p>
        )}

        {/* Signal breakdown */}
        {breakdownEntries.length > 0 && (
          <div className="space-y-1.5">
            {breakdownEntries.map((e) => (
              <div key={e.key} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{e.label}</span>
                <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold capitalize", signalPillClass(e.val!))}>
                  {e.val}
                </span>
              </div>
            ))}
            {consistency != null && (
              <div className="pt-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-muted">Cross-signal consistency</span>
                  <span className={cn("text-xs font-bold tabular-nums", scoreColor(consistency))}>{Math.round(consistency)}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className={cn("h-full rounded-full", scoreBarColor(consistency))}
                    style={{ width: `${Math.min(100, consistency)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inconsistencies */}
        {inconsistencies.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-warning">
              Resume / interview gaps
            </p>
            <ul className="space-y-1">
              {inconsistencies.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk factors (collapsible) */}
        {riskFactors.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowRisk((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold text-warning"
            >
              {riskFactors.length} risk factor{riskFactors.length > 1 ? "s" : ""}
              {showRisk ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {showRisk && (
              <ul className="mt-2 space-y-1">
                {riskFactors.map((r) => (
                  <li key={r} className="flex items-start gap-1.5 text-xs text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Divider */}
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

function MiniScore({ label, value, invert }: { label: string; value: number | null; invert: boolean }) {
  const pct = value ?? 0;
  const barPct = invert ? 100 - pct : pct;
  return (
    <div className="rounded-lg border border-border-subtle bg-background px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-0.5 text-xl font-bold tabular-nums", value != null ? scoreColor(value, invert) : "text-muted")}>
        {value != null ? `${Math.round(value)}%` : "—"}
      </p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border-subtle">
        <div
          className={cn("h-full rounded-full", value != null ? scoreBarColor(value, invert) : "")}
          style={{ width: value != null ? `${barPct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
