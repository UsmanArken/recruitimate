import type { VideoBehavioralResult } from "@/lib/intelligence/types";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { Shield, Video } from "lucide-react";

export function parseVideoBehavioralMetrics(value: unknown): VideoBehavioralResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as VideoBehavioralResult;
  if (typeof v.engagementScore !== "number" || !v.consentGiven) return null;
  return v;
}

const sourceLabels: Record<VideoBehavioralResult["source"], string> = {
  webcam_live: "Live webcam",
  recording_playback: "Recording playback",
  motion_fallback: "Motion fallback",
};

export function VideoBehavioralPanel({ metrics }: { metrics: VideoBehavioralResult }) {
  return (
    <section className="rounded-lg border border-brand/25 bg-brand/5 p-4">
      <h4 className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Video className="h-4 w-4 text-brand" />
        Video behavioral metrics
        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
          Phase 2
        </span>
        <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase text-success">
          Consent on file
        </span>
      </h4>

      <p className="mb-3 flex items-start gap-2 rounded-lg border border-border-subtle bg-card px-3 py-2 text-xs text-muted">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        {metrics.ethicalNotice}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreBadge label="Engagement" score={metrics.engagementScore} />
        <ScoreBadge label="Attention" score={metrics.attentionScore} />
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Face visible</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.faceVisiblePercent}%</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Samples</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.sampleCount}</p>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted">
        Source: {sourceLabels[metrics.source]} · {metrics.durationSec}s capture · Consent recorded{" "}
        {new Date(metrics.consentAt).toLocaleString()}
      </p>

      {metrics.signals.length > 0 && <SignalList signals={metrics.signals} />}

      {metrics.explanation && (
        <p className="mt-3 text-xs italic text-muted">{metrics.explanation}</p>
      )}
    </section>
  );
}
