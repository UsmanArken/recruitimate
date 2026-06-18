import { cn, formatScore, scoreColor, scoreBarColor } from "@/lib/utils";

export function ScoreBadge({
  label,
  score,
  className,
  invertBar,
  emptyLabel,
}: {
  label: string;
  score: number | null | undefined;
  className?: string;
  /** For hesitation — lower is better */
  invertBar?: boolean;
  /** Shown when score is null (e.g. missing hiring campaign). */
  emptyLabel?: string;
}) {
  const pct = score != null ? Math.min(100, Math.max(0, Math.round(score))) : 0;
  const barPct = invertBar && score != null ? 100 - pct : pct;

  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-card p-4 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          "mt-1 font-bold tabular-nums",
          score != null ? "text-2xl" : "text-sm",
          scoreColor(score, invertBar)
        )}
      >
        {score != null ? formatScore(score) : (emptyLabel ?? "—")}
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
