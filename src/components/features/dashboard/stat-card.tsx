import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconTones = {
  teal: "bg-teal-50 text-primary",
  navy: "bg-brand/10 text-brand",
  sage: "bg-decision-bg text-decision",
  slate: "bg-background text-muted",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "teal",
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: keyof typeof iconTones;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              iconTones[tone]
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
