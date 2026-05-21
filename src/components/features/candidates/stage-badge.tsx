import { cn } from "@/lib/utils";

const stageStyles: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  TALENT_REVIEW: "bg-violet-50 text-violet-800 ring-1 ring-violet-200/80",
  SHORTLISTED: "bg-teal-50 text-teal-800 ring-1 ring-teal-200/80",
  INTERVIEW_SCHEDULED: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
  INTERVIEWED: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80",
  DECISION: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  HIRED: "bg-success-bg text-success ring-1 ring-emerald-200/80",
  REJECTED: "bg-risk-bg text-risk ring-1 ring-red-200/60",
};

const stageLabels: Record<string, string> = {
  NEW: "New applicant",
  TALENT_REVIEW: "Talent review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERVIEWED: "Interviewed",
  DECISION: "Decision pending",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export function StageBadge({ stage }: { stage: string }) {
  const key = stage.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        stageStyles[key] ?? stageStyles.NEW
      )}
    >
      {stageLabels[key] ?? stage.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
