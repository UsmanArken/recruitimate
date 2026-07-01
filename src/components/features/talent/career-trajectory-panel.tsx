"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { formatScore, scoreColor } from "@/lib/utils";
import { Loader2, RefreshCw, TrendingUp } from "lucide-react";
import type { CareerTrajectoryResult } from "@/lib/intelligence/types";

const velocityLabel: Record<string, string> = {
  slow: "Slow",
  steady: "Steady",
  fast: "Fast",
  unknown: "Unknown",
};

export function CareerTrajectoryPanel({
  candidateId,
  readOnly = false,
}: {
  candidateId: string;
  readOnly?: boolean;
}) {
  const [trajectory, setTrajectory] = useState<CareerTrajectoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(method: "GET" | "POST" = "GET") {
    if (method === "POST") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/career-trajectory`, {
        method,
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not load trajectory");
        return;
      }
      setTrajectory(data.trajectory ?? null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load("GET");
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Modeling career trajectory…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-talent" />
          Career trajectory
          <span className="rounded-full bg-talent-bg px-2 py-0.5 text-[10px] font-bold uppercase text-talent">
            P3-008
          </span>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => void load("POST")}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recompute
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-risk">{error}</p>}

      {!trajectory ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            No trajectory computed yet. Add resume or LinkedIn history, then recompute.
          </p>
          {!readOnly && (
            <Button type="button" onClick={() => void load("POST")} disabled={refreshing}>
              Compute trajectory
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-subtle bg-background p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                Growth consistency
              </p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${scoreColor(trajectory.growthConsistencyScore)}`}>
                {formatScore(trajectory.growthConsistencyScore)}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-background p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                Tenure stability
              </p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${scoreColor(trajectory.tenureStabilityScore)}`}>
                {formatScore(trajectory.tenureStabilityScore)}
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-background p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                Promotion velocity
              </p>
              <p className="mt-1 text-2xl font-bold">
                {velocityLabel[trajectory.promotionVelocity] ?? trajectory.promotionVelocity}
              </p>
            </div>
          </div>

          {trajectory.rolesIdentified.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Roles identified
              </p>
              <ul className="space-y-1 text-sm">
                {trajectory.rolesIdentified.map((role, i) => (
                  <li key={`${role.title}-${i}`} className="flex flex-wrap gap-2 text-foreground/90">
                    <span className="font-medium">{role.title}</span>
                    {role.company && <span className="text-muted">at {role.company}</span>}
                    {role.period && (
                      <span className="text-xs text-muted">({role.period})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trajectory.signals.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Trajectory signals</p>
              <SignalList signals={trajectory.signals} />
            </div>
          )}

          <p className="text-xs italic text-muted">{trajectory.explanation}</p>
        </>
      )}
    </div>
  );
}
