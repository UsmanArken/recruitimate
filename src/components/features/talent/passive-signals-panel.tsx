"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatScore, scoreColor } from "@/lib/utils";
import { Globe2, Loader2, Radar } from "lucide-react";
import type { PassiveSignalsResult } from "@/lib/intelligence/types";

export function PassiveSignalsPanel({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PassiveSignalsResult | null>(null);

  async function fetchSignals() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/passive-signals`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not fetch passive signals");
        return;
      }
      setResult(data.signals as PassiveSignalsResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Globe2 className="h-4 w-4 text-primary" />
            Passive candidate signals
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
              P3-007
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            External labor market data for <span className="font-medium">{jobTitle}</span> — openness
            likelihood and skill scarcity from the configured provider.
          </p>
        </div>
        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void fetchSignals()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          Scan labor market
        </Button>
      </div>

      {error && <p className="text-xs text-risk">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border-subtle bg-background p-4 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Demand index</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {Math.round(result.marketContext.demandScore * 100)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Est. talent pool</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {result.marketContext.talentPoolEstimate}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Avg. openness</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {Math.round(result.marketContext.averageOpenness * 100)}%
              </p>
            </div>
          </div>

          <p className="text-xs text-muted">
            Provider: <strong className="text-foreground">{result.provider}</strong> ·{" "}
            {result.marketContext.explanation}
          </p>

          {result.marketContext.scarceSkills.length > 0 && (
            <p className="text-xs text-talent">
              Scarce skills: {result.marketContext.scarceSkills.join(" · ")}
            </p>
          )}

          <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
            {result.leads.map((lead) => (
              <li key={lead.id} className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{lead.name}</p>
                    {lead.headline && <p className="text-xs text-muted">{lead.headline}</p>}
                    {lead.location && (
                      <p className="text-[11px] text-muted">{lead.location}</p>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${scoreColor(lead.matchScore)}`}>
                    {formatScore(lead.matchScore)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-md bg-success-bg px-2 py-0.5 text-success">
                    {Math.round(lead.opennessLikelihood * 100)}% open
                  </span>
                  <span className="rounded-md bg-talent-bg px-2 py-0.5 text-talent">
                    demand {Math.round(lead.marketDemandScore * 100)}%
                  </span>
                </div>
                {lead.skills.length > 0 && (
                  <p className="mt-1 text-[11px] text-muted">{lead.skills.join(" · ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
