import { UserSearch, Mic2, ClipboardCheck, FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const layers = {
  talent: {
    icon: UserSearch,
    label: "Talent Intelligence",
    className: "bg-talent-bg text-talent border-violet-200/60",
  },
  interview: {
    icon: Mic2,
    label: "Interview Intelligence",
    className: "bg-interview-bg text-interview border-teal-200/60",
  },
  assessment: {
    icon: FlaskConical,
    label: "Assessment",
    className: "bg-amber-500/10 text-amber-700 border-amber-200/60",
  },
  decision: {
    icon: ClipboardCheck,
    label: "Decision Intelligence",
    className: "bg-decision-bg text-decision border-emerald-200/60",
  },
} as const;

export function LayerBadge({
  layer,
  size = "default",
}: {
  layer: keyof typeof layers;
  size?: "default" | "sm";
}) {
  const l = layers[layer];
  const Icon = l.icon as LucideIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        l.className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={2.5} />
      {l.label}
    </span>
  );
}
