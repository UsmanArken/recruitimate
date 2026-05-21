import { cn, formatScore, scoreColor, scoreBarColor } from "@/lib/utils";

export function ScoreBadge({
  label,
  score,
  className,
  invertBar,
}: {
  label: string;
  score: number | null | undefined;
  className?: string;
  /** For hesitation — lower is better */
  invertBar?: boolean;
}) {
  const pct = score != null ? Math.round(score * 100) : 0;
  const barPct = invertBar && score != null ? 100 - pct : pct;

  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-card p-4 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", scoreColor(score, invertBar))}>
        {formatScore(score)}
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <div
          className={cn("h-full rounded-full transition-all", scoreBarColor(score, invertBar))}
          style={{ width: score != null ? `${barPct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
