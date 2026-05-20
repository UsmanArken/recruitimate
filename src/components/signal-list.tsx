import type { Signal } from "@/lib/intelligence/types";

export function SignalList({ signals, empty }: { signals: Signal[]; empty?: string }) {
  if (!signals.length) {
    return <p className="text-sm text-muted">{empty ?? "No signals yet."}</p>;
  }

  return (
    <ul className="space-y-3">
      {signals.map((s, i) => (
        <li key={`${s.label}-${i}`} className="rounded-lg border border-border/60 bg-background p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium">{s.label}</span>
            <span className="shrink-0 rounded-full bg-muted/30 px-2 py-0.5 text-xs capitalize text-muted">
              {s.confidence}
            </span>
          </div>
          <p className="mt-1 text-sm">{s.value}</p>
          <p className="mt-2 text-xs text-muted">Evidence: {s.evidence}</p>
        </li>
      ))}
    </ul>
  );
}
