"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlaskConical, Loader2 } from "lucide-react";
import type { AssessmentTaskKind } from "@/lib/intelligence/types";

type FocusOption = AssessmentTaskKind | "all";

export function AssessmentTaskPanel({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [focus, setFocus] = useState<FocusOption>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    tasks: { id: string; title: string; taskType: string; difficulty: string; prompt: string }[];
    roleSummary: string;
    explanation: string;
  } | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/assessment-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ focus, count: 3 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not generate tasks");
        return;
      }
      setResult(data as typeof result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-amber-500/25 bg-card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FlaskConical className="h-4 w-4 text-amber-700" />
            Assessment tasks
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
              P2-015
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            AI-generated real-world scenarios for {jobTitle} — code, product, ops, or cross-functional.
          </p>
        </div>
        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void generate()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          Generate tasks
        </Button>
      </div>

      <select
        className="mb-3 rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={focus}
        onChange={(e) => setFocus(e.target.value as FocusOption)}
      >
        <option value="all">All types</option>
        <option value="code">Code</option>
        <option value="product">Product</option>
        <option value="ops">Ops</option>
        <option value="scenario">Scenario</option>
      </select>

      {error && <p className="text-xs text-risk">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-xs text-muted">{result.explanation}</p>
          <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
            {result.tasks.map((t) => (
              <li key={t.id} className="p-3">
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-[11px] uppercase text-muted">
                  {t.taskType} · {t.difficulty}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{t.prompt.slice(0, 400)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
