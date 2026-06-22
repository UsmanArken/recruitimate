"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatScore, scoreColor } from "@/lib/utils";
import { Loader2, UserSearch } from "lucide-react";
import type { TalentSuggestResult } from "@/lib/intelligence/types";

export function SuggestedCandidatesPanel({
  jobId,
  jobTitle,
  compact = false,
}: {
  jobId: string;
  jobTitle: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TalentSuggestResult | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/suggested-candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ limit: compact ? 5 : 10 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load suggestions");
        return;
      }
      setResult(data as TalentSuggestResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={
        compact
          ? "rounded-lg border border-border-subtle bg-card/50 p-4"
          : "rounded-lg border-2 border-emerald-500/20 bg-card p-4"
      }
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <UserSearch className="h-4 w-4 text-success" />
            Suggested candidates
            <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
              P2-011
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            Recommend internal talent from your discovery corpus who are not already on{" "}
            <span className="font-medium">{jobTitle}</span>.
          </p>
        </div>
        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void suggest()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserSearch className="h-4 w-4" />}
          Find suggestions
        </Button>
      </div>

      {error && <p className="text-xs text-risk">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-xs text-muted">{result.explanation}</p>
          {result.suggestions.length === 0 ? (
            <p className="text-sm text-muted">
              No eligible internal candidates — ingest more profiles on the Talent page or bulk
              upload resumes.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
              {result.suggestions.map((s) => (
                <li key={s.candidateId} className="p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/candidates/${s.candidateId}`}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {s.name}
                      </Link>
                      {s.email && <p className="text-xs text-muted">{s.email}</p>}
                    </div>
                    <span className={`text-sm font-bold ${scoreColor(s.matchScore)}`}>
                      {formatScore(s.matchScore)}
                    </span>
                  </div>
                  {s.matchedSkills.length > 0 && (
                    <p className="mt-1 text-[11px] text-talent">{s.matchedSkills.join(" · ")}</p>
                  )}
                  {s.strengths.length > 0 && (
                    <p className="mt-1 text-xs text-muted">{s.strengths[0]}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
