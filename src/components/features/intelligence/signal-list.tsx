import type { Signal } from "@/lib/intelligence/types";
import { Info } from "lucide-react";

const confidenceStyles = {
  high: "bg-success-bg text-success",
  medium: "bg-warning-bg text-warning",
  low: "bg-background text-muted ring-1 ring-border",
};

export function SignalList({ signals, empty }: { signals: Signal[]; empty?: string }) {
  if (!signals.length) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-6 text-center text-sm text-muted">
        {empty ?? "No signals recorded yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {signals.map((s, i) => (
        <li
          key={`${s.label}-${i}`}
          className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold text-foreground">{s.label}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                confidenceStyles[s.confidence]
              }`}
            >
              {s.confidence}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{s.value}</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span>
              <span className="font-medium text-muted-foreground">Evidence: </span>
              {s.evidence}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
