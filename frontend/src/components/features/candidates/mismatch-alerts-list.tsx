import type { InconsistencyFlag, MismatchAlert } from "@/lib/intelligence/types";
import { AlertTriangle, GitCompareArrows, Scale } from "lucide-react";

const severityStyles = {
  high: "bg-risk-bg text-risk ring-1 ring-risk/20",
  medium: "bg-warning-bg text-warning ring-1 ring-warning/20",
  low: "bg-background text-muted ring-1 ring-border",
};

const confidenceStyles = {
  high: "bg-success-bg text-success",
  medium: "bg-warning-bg text-warning",
  low: "bg-background text-muted ring-1 ring-border",
};

const mismatchTypeLabels: Record<MismatchAlert["type"], string> = {
  contradiction: "Contradiction",
  unsupported_claim: "Unverified claim",
  experience_gap: "Experience gap",
  skill_gap: "Skill gap",
  timeline: "Timeline",
};

export function MismatchAlertsList({ alerts }: { alerts: MismatchAlert[] }) {
  if (!alerts.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-4 text-center text-sm text-muted">
        No resume vs interview mismatches detected yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className="rounded-lg border border-warning/30 bg-warning-bg/20 p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <GitCompareArrows className="h-3.5 w-3.5 text-warning" />
              <span className="text-sm font-semibold">{alert.label}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/80 ring-1 ring-border">
                {mismatchTypeLabels[alert.type]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityStyles[alert.severity]}`}
              >
                {alert.severity}
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-md bg-card px-2.5 py-2 ring-1 ring-border-subtle">
              <p className="font-semibold text-muted-foreground">Resume says</p>
              <p className="mt-1 text-foreground/90">{alert.resumeClaim}</p>
            </div>
            <div className="rounded-md bg-card px-2.5 py-2 ring-1 ring-border-subtle">
              <p className="font-semibold text-muted-foreground">Interview says</p>
              <p className="mt-1 text-foreground/90">{alert.interviewStatement}</p>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted">
            <span className="font-medium">Evidence: </span>
            {alert.evidence}
            <span
              className={`ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${confidenceStyles[alert.confidence]}`}
            >
              {alert.confidence}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function InconsistencyFlagsList({ flags }: { flags: InconsistencyFlag[] }) {
  if (!flags.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-4 text-center text-sm text-muted">
        No live contradictions detected in the transcript so far.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {flags.map((flag, i) => (
        <li
          key={`${flag.label}-${i}`}
          className="rounded-lg border border-risk/25 bg-risk-bg/15 p-3 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-risk" />
              <span className="text-sm font-semibold">{flag.label}</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityStyles[flag.severity]}`}
            >
              {flag.severity}
            </span>
          </div>
          <p className="mt-2 text-sm text-foreground/90">{flag.value}</p>
          <p className="mt-1 text-xs text-muted">
            <span className="font-medium">Evidence: </span>
            {flag.evidence}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function CrossSignalSummaryBanner({ summary }: { summary: string }) {
  if (!summary.trim()) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-border-subtle bg-card px-3 py-2 text-sm text-foreground/90">
      <Scale className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>
        <span className="font-semibold">Cross-signal: </span>
        {summary}
      </span>
    </p>
  );
}
