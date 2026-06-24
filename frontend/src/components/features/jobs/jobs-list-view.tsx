"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ArrowRight, Briefcase, Building2, LayoutGrid, List, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type JobRow = {
  id: string;
  title: string;
  description: string | null;
  applicationCount: number;
  hiringClient: { id: string; name: string; website: string | null } | null;
};

export function JobsListView({ jobs }: { jobs: JobRow[] }) {
  const [view, setView] = useState<"cards" | "list">("cards");
  const [clientFilter, setClientFilter] = useState<string>("all");

  // Build unique client list from jobs
  const clientOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const job of jobs) {
      if (job.hiringClient) seen.set(job.hiringClient.id, job.hiringClient.name);
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (clientFilter === "all") return jobs;
    if (clientFilter === "none") return jobs.filter((j) => !j.hiringClient);
    return jobs.filter((j) => j.hiringClient?.id === clientFilter);
  }, [jobs, clientFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Client filter */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted" />
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All companies</option>
            {clientOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            {clientOptions.length > 0 && <option value="none">No client</option>}
          </select>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <ViewToggle active={view === "cards"} onClick={() => setView("cards")} icon={LayoutGrid} label="Cards" />
          <ViewToggle active={view === "list"} onClick={() => setView("list")} icon={List} label="List" />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No roles match the selected filter.</p>
      ) : view === "cards" ? (
        <CardsView jobs={filteredJobs} />
      ) : (
        <ListView jobs={filteredJobs} />
      )}
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

function CardsView({ jobs }: { jobs: JobRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`}>
          <Card className="transition hover:border-primary/30 hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <Briefcase className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <CardTitle>{job.title}</CardTitle>
                    {job.hiringClient && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-brand">
                        <Building2 className="h-3 w-3" />
                        {job.hiringClient.name}
                      </p>
                    )}
                    <CardDescription className="mt-1 line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted">
                <Users className="h-4 w-4" />
                {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""} in pipeline · Manage team →
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function ListView({ jobs }: { jobs: JobRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <ul>
        {jobs.map((job) => (
          <li key={job.id} className="border-t border-border-subtle first:border-t-0">
            <Link
              href={`/jobs/${job.id}`}
              className="flex items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
            >
              <Briefcase className="h-5 w-5 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{job.title}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                  {job.hiringClient && (
                    <span className="flex items-center gap-1 font-medium text-brand">
                      <Building2 className="h-3 w-3" />
                      {job.hiringClient.name}
                    </span>
                  )}
                  <span>{job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""} in pipeline</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
