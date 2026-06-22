"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatScore, scoreColor } from "@/lib/utils";
import { Loader2, Search, Sparkles } from "lucide-react";
import type { TalentSearchResult } from "@/lib/intelligence/types";

type PoolOption = { id: string; name: string };

const EXAMPLE_QUERIES = [
  "backend engineers with distributed systems",
  "senior react typescript full stack",
  "data engineering spark kafka",
];

export function TalentSearchPanel() {
  const [query, setQuery] = useState("");
  const [poolId, setPoolId] = useState("");
  const [pools, setPools] = useState<PoolOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TalentSearchResult | null>(null);

  const loadPools = useCallback(async () => {
    const res = await fetch("/api/talent/pools", { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && Array.isArray(data.pools)) {
      setPools(data.pools.map((p: PoolOption) => ({ id: p.id, name: p.name })));
    }
  }, []);

  useEffect(() => {
    void loadPools();
  }, [loadPools]);

  async function search() {
    if (query.trim().length < 3) {
      setError("Enter at least 3 characters to search.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/talent/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          query: query.trim(),
          poolId: poolId || undefined,
          limit: 20,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Search failed");
        return;
      }
      setResult(data as TalentSearchResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-talent/30 bg-card p-4">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Search className="h-4 w-4 text-talent" />
          Ranked candidate search
          <span className="rounded-full bg-talent-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-talent">
            P2-010
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted">
          Natural-language search across your indexed talent corpus. Example: &quot;Find backend
          engineers with distributed systems&quot;.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder='e.g. "backend engineers with distributed systems"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void search()}
        />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
        >
          <option value="">All talent</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button type="button" onClick={() => void search()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Search
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-full bg-background px-2.5 py-1 text-[11px] text-muted ring-1 ring-border hover:text-primary"
            onClick={() => setQuery(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-xs text-risk">{error}</p>}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted">
            {result.results.length} match{result.results.length === 1 ? "" : "es"} from{" "}
            {result.totalCandidates} indexed · {result.explanation}
          </p>
          {result.results.length === 0 ? (
            <p className="text-sm text-muted">No strong matches — try broader terms or reindex.</p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
              {result.results.map((row) => (
                <li key={row.candidateId} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div>
                    <Link
                      href={`/candidates/${row.candidateId}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.email && <p className="text-xs text-muted">{row.email}</p>}
                    <p className="mt-1 text-xs text-muted">{row.explanation}</p>
                    {row.matchedSkills.length > 0 && (
                      <p className="mt-1 text-[11px] text-talent">
                        {row.matchedSkills.join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${scoreColor(row.matchScore)}`}>
                    {formatScore(row.matchScore)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
