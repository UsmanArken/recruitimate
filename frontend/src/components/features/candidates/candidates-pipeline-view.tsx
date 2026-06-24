"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { cn, formatScore, scoreColor } from "@/lib/utils";
import { Avatar } from "@/components/features/candidates/avatar";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export type PipelineApplicationRow = {
  id: string;
  stage: string;
  candidate: { id: string; name: string; email: string | null };
  job: { id: string; title: string };
  talentProfile: { roleFitScore: number | null } | null;
  decision: { recommendation: string | null } | null;
  hireReviewVerdict: string | null;
};

const STAGES = [
  "NEW",
  "TALENT_REVIEW",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "INTERVIEWED",
  "DECISION",
  "HIRED",
  "REJECTED",
] as const;

export function CandidatesPipelineView({
  applications,
  jobs,
}: {
  applications: PipelineApplicationRow[];
  jobs: { id: string; title: string }[];
}) {
  const [view, setView] = useState<"table" | "cards">("table");
  const [jobId, setJobId] = useState("");
  const [stage, setStage] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      if (jobId && app.job.id !== jobId) return false;
      if (stage && app.stage !== stage) return false;
      if (q) {
        const hay = `${app.candidate.name} ${app.candidate.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, jobId, stage, search]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-card p-4">
        <div className="min-w-[12rem] flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="input-hr pl-9"
              placeholder="Name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <FilterSelect label="Open role" value={jobId} onChange={setJobId}>
          <option value="">All roles</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Stage" value={stage} onChange={setStage}>
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </FilterSelect>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <ViewToggle active={view === "table"} onClick={() => setView("table")} icon={List} label="List" />
          <ViewToggle active={view === "cards"} onClick={() => setView("cards")} icon={LayoutGrid} label="Cards" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title="No matches"
              description="Try clearing filters or add applicants from an open role."
              primaryAction={{ href: "/candidates/new", label: "Add candidate" }}
            />
          </CardContent>
        </Card>
      ) : view === "table" ? (
        <TableView rows={filtered} />
      ) : (
        <CardsView rows={filtered} />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-[10rem]">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <select className="input-hr" value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition",
        active ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function TableView({ rows }: { rows: PipelineApplicationRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="table-hr w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-5 py-3.5">Candidate</th>
            <th className="px-5 py-3.5">Open position</th>
            <th className="px-5 py-3.5">Stage</th>
            <th className="px-5 py-3.5">Role fit</th>
            <th className="px-5 py-3.5">AI recommendation</th>
            <th className="px-5 py-3.5">Recruiter decision</th>
            <th className="px-5 py-3.5">Talent review</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((app) => (
            <tr key={app.id}>
              <td className="px-5 py-4">
                <Link
                  href={`/candidates/${app.candidate.id}`}
                  className="flex items-center gap-3 font-semibold text-foreground hover:text-primary"
                >
                  <Avatar name={app.candidate.name} size="sm" />
                  {app.candidate.name}
                </Link>
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {app.job.title}
                </Link>
              </td>
              <td className="px-5 py-4">
                <StageBadge stage={app.stage} />
              </td>
              <td className={`px-5 py-4 font-semibold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}>
                {formatScore(app.talentProfile?.roleFitScore)}
              </td>
              <td className="px-5 py-4">
                <AiRecBadge recommendation={app.decision?.recommendation ?? null} />
              </td>
              <td className="px-5 py-4">
                <RecruiterVerdictBadge verdict={app.hireReviewVerdict} />
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/candidates/${app.candidate.id}/applications/${app.id}?tab=talent`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  Open talent review →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardsView({ rows }: { rows: PipelineApplicationRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((app) => (
        <Card key={app.id} className="transition hover:border-primary/30 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Avatar name={app.candidate.name} />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/candidates/${app.candidate.id}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {app.candidate.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted">{app.job.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StageBadge stage={app.stage} />
                  <span className={`text-sm font-bold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}>
                    {formatScore(app.talentProfile?.roleFitScore)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AiRecBadge recommendation={app.decision?.recommendation ?? null} />
                  <RecruiterVerdictBadge verdict={app.hireReviewVerdict} />
                </div>
                <Link
                  href={`/candidates/${app.candidate.id}/applications/${app.id}?tab=talent`}
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Open talent review →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const AI_REC_LABELS: Record<string, { label: string; cls: string }> = {
  HIRE:        { label: "Hire",         cls: "bg-success-bg text-success" },
  LEAN_HIRE:   { label: "Lean hire",    cls: "bg-success-bg text-success" },
  HOLD:        { label: "Hold",         cls: "bg-warning-bg text-warning" },
  LEAN_REJECT: { label: "Lean reject",  cls: "bg-risk-bg text-risk" },
  REJECT:      { label: "Reject",       cls: "bg-risk-bg text-risk" },
};

function AiRecBadge({ recommendation }: { recommendation: string | null }) {
  if (!recommendation) return <span className="text-xs text-muted">—</span>;
  const cfg = AI_REC_LABELS[recommendation];
  if (!cfg) return <span className="text-xs text-muted">{recommendation}</span>;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

const RECRUITER_VERDICT_LABELS: Record<string, { label: string; cls: string }> = {
  PASS:    { label: "Pass", cls: "bg-success-bg text-success" },
  HOLD:    { label: "Hold", cls: "bg-warning-bg text-warning" },
  FAIL:    { label: "Fail", cls: "bg-risk-bg text-risk" },
  PENDING: { label: "—",    cls: "" },
};

function RecruiterVerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  const key = verdict ?? "PENDING";
  const cfg = RECRUITER_VERDICT_LABELS[key] ?? RECRUITER_VERDICT_LABELS.PENDING;
  if (cfg.label === "—") return <span className="text-xs text-muted">—</span>;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
