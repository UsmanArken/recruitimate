"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase } from "lucide-react";

export type JobListRow = {
  id: string;
  title: string;
  description: string;
  hiringClient: { id: string; name: string; website: string | null } | null;
  _count: { applications: number };
};

export function JobsListView({ jobs }: { jobs: JobListRow[] }) {
  const [view, setView] = useState<"cards" | "list">("cards");
  const [clientId, setClientId] = useState("");

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    for (const j of jobs) {
      if (j.hiringClient) map.set(j.hiringClient.id, j.hiringClient.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [jobs]);

  const filtered = jobs.filter((j) => !clientId || j.hiringClient?.id === clientId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-subtle bg-card p-4">
        {clients.length > 0 && (
          <div className="min-w-[12rem]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Client company
            </label>
            <select
              className="input-hr"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">All companies</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="ml-auto flex gap-1 rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold",
              view === "cards" ? "bg-primary text-primary-foreground" : "text-muted"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold",
              view === "list" ? "bg-primary text-primary-foreground" : "text-muted"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  {job.hiringClient && (
                    <CardDescription>{job.hiringClient.name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted">{job.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand">
                    {job._count.applications} in pipeline
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ul>
            {filtered.map((job) => (
              <li key={job.id} className="border-t border-border-subtle first:border-t-0">
                <Link
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-teal-50/40"
                >
                  <Briefcase className="h-5 w-5 text-brand" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-sm text-muted">
                      {job.hiringClient?.name ?? "No client"} · {job._count.applications} in
                      pipeline
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
