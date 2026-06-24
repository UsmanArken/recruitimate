import { CheckCircle2, HelpCircle, Mic2, Sparkles, TrendingDown, TrendingUp, XCircle } from "lucide-react";

const AI_REC_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; bannerClass: string }> = {
  HIRE:        { label: "Recommend hire",  icon: CheckCircle2, bannerClass: "bg-success-bg text-success ring-1 ring-emerald-200" },
  LEAN_HIRE:   { label: "Lean hire",       icon: TrendingUp,   bannerClass: "bg-success-bg text-success ring-1 ring-emerald-200" },
  HOLD:        { label: "Hold for review", icon: HelpCircle,   bannerClass: "bg-warning-bg text-warning ring-1 ring-amber-200" },
  LEAN_REJECT: { label: "Lean reject",     icon: TrendingDown, bannerClass: "bg-risk-bg text-risk ring-1 ring-red-200/60" },
  REJECT:      { label: "Not recommended", icon: XCircle,      bannerClass: "bg-risk-bg text-risk ring-1 ring-red-300/60" },
};

const RECRUITER_VERDICT_CONFIG: Record<string, { label: string; bannerClass: string }> = {
  PASS: { label: "Pass",             bannerClass: "bg-success-bg text-success ring-1 ring-emerald-200" },
  HOLD: { label: "Hold",             bannerClass: "bg-warning-bg text-warning ring-1 ring-amber-200" },
  FAIL: { label: "Fail",             bannerClass: "bg-risk-bg text-risk ring-1 ring-red-200/60" },
  PENDING: { label: "Not yet set",   bannerClass: "bg-background text-muted ring-1 ring-border" },
};

interface Props {
  jobTitle: string | null | undefined;
  recommendation: string | null | undefined;
  roleFitScore: number | null | undefined;
  explanation: string | null | undefined;
  hasInterview: boolean;
  hireReviewVerdict: string | null | undefined;
}

export function IntelligencePhasePanel({
  jobTitle,
  recommendation,
  roleFitScore,
  explanation,
  hasInterview,
  hireReviewVerdict,
}: Props) {
  const isDecisionReady = hasInterview && recommendation && recommendation !== "pending_interview";

  const recruiterBadge = RECRUITER_VERDICT_CONFIG[hireReviewVerdict ?? "PENDING"] ?? RECRUITER_VERDICT_CONFIG.PENDING;

  if (isDecisionReady) {
    const rec = AI_REC_CONFIG[recommendation!] ?? {
      label: recommendation!.replace(/_/g, " "),
      icon: HelpCircle,
      bannerClass: "bg-background text-muted ring-1 ring-border",
    };
    const RecIcon = rec.icon;

    return (
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-6 py-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-decision">
            Hiring recommendation{jobTitle ? ` — ${jobTitle}` : ""}
          </p>
          <p className="text-sm text-muted">
            Advisory summary for your hiring committee — talent + interview signals combined.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {roleFitScore != null && (
              <ScoreTile label="Role fit (resume)" score={roleFitScore} />
            )}
            <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                Recruitimate recommendation
              </p>
              <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${rec.bannerClass}`}>
                <RecIcon className="h-4 w-4" />
                {rec.label}
              </span>
            </div>
            <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                Committee recommendation
              </p>
              <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${recruiterBadge.bannerClass}`}>
                {recruiterBadge.label}
              </span>
            </div>
          </div>

          {explanation && (
            <p className="rounded-lg border border-border-subtle bg-background px-4 py-3 text-sm leading-relaxed italic text-muted">
              {explanation}
            </p>
          )}
        </div>
      </section>
    );
  }

  // Preliminary screening (no interview yet)
  return (
    <section className="border-b border-border bg-card/60">
      <div className="mx-auto max-w-7xl px-6 py-5 space-y-4">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-interview">
          <Sparkles className="h-3.5 w-3.5" />
          Preliminary screening{jobTitle ? ` — ${jobTitle}` : ""}
        </p>
        <p className="text-sm text-muted">
          Resume matched to this requisition. A hire recommendation is advisory-only and requires
          interview intelligence — we do not guess a final decision from a CV alone.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {roleFitScore != null && (
            <ScoreTile label="Role fit (resume)" score={roleFitScore} />
          )}
          <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              Recruitimate recommendation
            </p>
            <span className="inline-flex items-center gap-2 rounded-lg bg-interview-bg px-3 py-1.5 text-sm font-bold text-interview ring-1 ring-teal-200/60">
              <Mic2 className="h-4 w-4" />
              Awaiting interview
            </span>
          </div>
          <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              Committee recommendation
            </p>
            <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${recruiterBadge.bannerClass}`}>
              {recruiterBadge.label}
            </span>
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm font-medium text-interview">
          <Mic2 className="h-4 w-4" />
          Next step: open the Interview tab to record and analyze the conversation.
        </p>
      </div>
    </section>
  );
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  const pct = Math.round(Math.min(100, Math.max(0, score)));
  const colorClass = pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-risk";
  const barColor = pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-risk";

  return (
    <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${colorClass}`}>{pct}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
