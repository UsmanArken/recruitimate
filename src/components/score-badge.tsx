import { cn, formatScore, scoreColor } from "@/lib/utils";

export function ScoreBadge({
  label,
  score,
  className,
}: {
  label: string;
  score: number | null | undefined;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/60 bg-background p-3", className)}>
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", scoreColor(score))}>
        {formatScore(score)}
      </p>
    </div>
  );
}
