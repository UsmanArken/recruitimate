import type { PipelineStage } from "@prisma/client";

export type PipelineStageMeta = {
  id: PipelineStage;
  label: string;
  columnClass: string;
  kanbanOrder: number;
};

export const PIPELINE_STAGES: PipelineStageMeta[] = [
  {
    id: "NEW",
    label: "New applicant",
    columnClass: "border-slate-200 bg-slate-50/80",
    kanbanOrder: 0,
  },
  {
    id: "TALENT_REVIEW",
    label: "Talent review",
    columnClass: "border-violet-200 bg-violet-50/50",
    kanbanOrder: 1,
  },
  {
    id: "SHORTLISTED",
    label: "Shortlisted",
    columnClass: "border-teal-200 bg-teal-50/50",
    kanbanOrder: 2,
  },
  {
    id: "INTERVIEW_SCHEDULED",
    label: "Interview scheduled",
    columnClass: "border-sky-200 bg-sky-50/50",
    kanbanOrder: 3,
  },
  {
    id: "INTERVIEWED",
    label: "Interviewed",
    columnClass: "border-indigo-200 bg-indigo-50/50",
    kanbanOrder: 4,
  },
  {
    id: "DECISION",
    label: "Decision pending",
    columnClass: "border-amber-200 bg-amber-50/50",
    kanbanOrder: 5,
  },
  {
    id: "HIRED",
    label: "Hired",
    columnClass: "border-emerald-200 bg-emerald-50/50",
    kanbanOrder: 6,
  },
  {
    id: "REJECTED",
    label: "Rejected",
    columnClass: "border-red-200 bg-red-50/40",
    kanbanOrder: 7,
  },
];

export const PIPELINE_STAGE_IDS = PIPELINE_STAGES.map((s) => s.id);

export function pipelineStageLabel(stage: string): string {
  return PIPELINE_STAGES.find((s) => s.id === stage)?.label ?? stage.replace(/_/g, " ").toLowerCase();
}

export function pipelineStageBadgeClass(stage: string): string {
  const map: Record<string, string> = {
    NEW: "bg-slate-100 text-slate-700",
    TALENT_REVIEW: "bg-violet-50 text-violet-800 ring-1 ring-violet-200/80",
    SHORTLISTED: "bg-teal-50 text-teal-800 ring-1 ring-teal-200/80",
    INTERVIEW_SCHEDULED: "bg-sky-50 text-sky-800 ring-1 ring-sky-200/80",
    INTERVIEWED: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200/80",
    DECISION: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
    HIRED: "bg-success-bg text-success ring-1 ring-emerald-200/80",
    REJECTED: "bg-risk-bg text-risk ring-1 ring-red-200/60",
  };
  return map[stage.toUpperCase()] ?? map.NEW;
}
