"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

type Prediction = {
  probability: number | null;
  confidence: "low" | "medium" | "high";
  basis: { historicalSamples: number; comparableSamples: number; baseRate: number | null };
  explanation: string;
};

const confidenceClass: Record<string, string> = {
  low: "bg-warning-bg text-warning",
  medium: "bg-talent-bg text-talent",
  high: "bg-success-bg text-success",
};

function barColor(p: number): string {
  if (p >= 0.7) return "bg-success";
  if (p >= 0.45) return "bg-talent";
  return "bg-warning";
}

export function SuccessPredictionPanel({ applicationId }: { applicationId: string }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/applications/${applicationId}/success-prediction`, {
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not load prediction");
          return;
        }
        setPrediction(data.prediction);
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Modeling likelihood of success…
      </div>
    );
  }

  if (error || !prediction) {
    return <p className="text-sm text-risk">{error ?? "No prediction available."}</p>;
  }

  const pct = prediction.probability != null ? Math.round(prediction.probability * 100) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Predicted success in role
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums tracking-tight">
              {pct != null ? `${pct}%` : "—"}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                confidenceClass[prediction.confidence]
              }`}
            >
              {prediction.confidence} confidence
            </span>
          </p>
        </div>
        <TrendingUp className="h-8 w-8 text-primary/70" />
      </div>

      {pct != null && (
        <div className="h-2.5 overflow-hidden rounded-full bg-background">
          <div
            className={`h-full rounded-full ${barColor(prediction.probability ?? 0)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <p className="text-sm text-muted">{prediction.explanation}</p>

      <div className="flex flex-wrap gap-4 text-xs text-muted">
        <span>
          History: <strong className="text-foreground">{prediction.basis.historicalSamples}</strong>{" "}
          outcomes
        </span>
        <span>
          Comparable:{" "}
          <strong className="text-foreground">{prediction.basis.comparableSamples}</strong>
        </span>
        {prediction.basis.baseRate != null && (
          <span>
            Org base rate:{" "}
            <strong className="text-foreground">
              {Math.round(prediction.basis.baseRate * 100)}%
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}
