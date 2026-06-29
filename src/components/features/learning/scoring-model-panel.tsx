"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, RefreshCw } from "lucide-react";

type Weights = { talent: number; interview: number; assessment: number };

type ModelRow = {
  version: number;
  talentWeight: number;
  interviewWeight: number;
  assessmentWeight: number;
  sampleSize: number;
  positiveLabels: number;
  trainedAt: string;
  metadata: { notes?: string; confidence?: number } | null;
} | null;

type ModelResponse = {
  model: ModelRow;
  defaultWeights: Weights;
  trainableSamples: number;
  totalOutcomes: number;
};

function WeightBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ScoringModelPanel() {
  const [data, setData] = useState<ModelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/scoring-model", { credentials: "same-origin" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof json.error === "string" ? json.error : "Could not load scoring model");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, []);

  async function handleRetrain() {
    setRetraining(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/scoring-model/retrain", {
        method: "POST",
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Retrain failed");
      }
      setMessage(json?.result?.notes ?? "Model retrained.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retrain failed");
    } finally {
      setRetraining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading scoring model…
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-risk">{error ?? "No data."}</p>;
  }

  const active: Weights = data.model
    ? {
        talent: data.model.talentWeight,
        interview: data.model.interviewWeight,
        assessment: data.model.assessmentWeight,
      }
    : data.defaultWeights;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
        <Brain className="h-4 w-4 text-primary" />
        <span>
          {data.model
            ? `Learned model v${data.model.version} · trained on ${data.model.sampleSize} outcomes (${data.model.positiveLabels} good hires)`
            : "Using default weights — no model trained yet"}
        </span>
      </div>

      <div className="grid gap-4 rounded-xl border border-border-subtle bg-card p-4 shadow-sm sm:grid-cols-3">
        <WeightBar label="Talent" value={active.talent} />
        <WeightBar label="Interview" value={active.interview} />
        <WeightBar label="Assessment" value={active.assessment} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background px-4 py-3 text-sm">
        <div>
          <p className="font-medium">{data.trainableSamples} usable training outcomes</p>
          <p className="text-xs text-muted">
            {data.totalOutcomes} total recorded · hired/rejected outcomes with signal data feed
            retraining
          </p>
        </div>
        <Button type="button" onClick={handleRetrain} disabled={retraining}>
          {retraining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Retrain now
        </Button>
      </div>

      {data.model?.metadata?.notes && (
        <p className="text-xs italic text-muted">{data.model.metadata.notes}</p>
      )}
      {message && <p className="text-sm font-medium text-success">{message}</p>}
      {error && <p className="text-sm text-risk">{error}</p>}
    </div>
  );
}
