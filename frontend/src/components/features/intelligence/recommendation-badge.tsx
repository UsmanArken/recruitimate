import { cn } from "@/lib/utils";
import {
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Briefcase,
  Mic2,
} from "lucide-react";

const config: Record<
  string,
  { label: string; className: string; icon: typeof ThumbsUp }
> = {
  strong_yes: {
    label: "Strong yes",
    className: "bg-success-bg text-success ring-1 ring-emerald-200",
    icon: CheckCircle2,
  },
  yes: {
    label: "Recommend hire",
    className: "bg-teal-50 text-teal-800 ring-1 ring-teal-200",
    icon: ThumbsUp,
  },
  maybe: {
    label: "Needs discussion",
    className: "bg-warning-bg text-warning ring-1 ring-amber-200",
    icon: HelpCircle,
  },
  no: {
    label: "Not recommended",
    className: "bg-risk-bg text-risk ring-1 ring-red-200/60",
    icon: ThumbsDown,
  },
  strong_no: {
    label: "Strong no",
    className: "bg-risk-bg text-risk ring-1 ring-red-300/60",
    icon: XCircle,
  },
  pending_role: {
    label: "Awaiting open position",
    className: "bg-background text-muted ring-1 ring-border",
    icon: Briefcase,
  },
  pending_interview: {
    label: "Awaiting interview",
    className: "bg-interview-bg text-interview ring-1 ring-teal-200/60",
    icon: Mic2,
  },
};

export function RecommendationBadge({ value }: { value: string | null | undefined }) {
  if (!value) {
    return <span className="text-2xl font-bold text-muted">—</span>;
  }
  const c = config[value] ?? {
    label: value.replace(/_/g, " "),
    className: "bg-background text-muted",
    icon: HelpCircle,
  };
  const Icon = c.icon;
  return (
    <div className="flex flex-col gap-2">
      <span
        className={cn(
          "inline-flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
          c.className
        )}
      >
        <Icon className="h-4 w-4" />
        {c.label}
      </span>
    </div>
  );
}
