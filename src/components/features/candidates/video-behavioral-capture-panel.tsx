"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Video, VideoOff } from "lucide-react";
import type { VideoBehavioralResult } from "@/lib/intelligence/types";
import { VIDEO_ETHICAL_NOTICE } from "@/lib/intelligence/video/video-behavioral-engine";
import {
  captureRecordingUrlSamples,
  captureWebcamSamples,
} from "@/lib/intelligence/video/client-frame-analyzer";
import { isVideoRecordingPath } from "@/lib/intelligence/video/face-detector";
import {
  VideoBehavioralPanel,
  parseVideoBehavioralMetrics,
} from "@/components/features/interview/video-behavioral-panel";

export function VideoBehavioralCapturePanel({
  applicationId,
  interviewId,
  recordingPath,
  initialMetrics,
}: {
  applicationId: string;
  interviewId?: string;
  recordingPath?: string | null;
  initialMetrics?: VideoBehavioralResult | null;
}) {
  const router = useRouter();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [candidateInformed, setCandidateInformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [metrics, setMetrics] = useState<VideoBehavioralResult | null>(
    initialMetrics ?? null
  );

  const canCapture = consentAccepted && candidateInformed && Boolean(interviewId);

  async function submitSamples(
    samples: { atSec: number; faceDetected: boolean; engagement: number; attention: number }[],
    source: "webcam_live" | "recording_playback" | "motion_fallback",
    durationSec: number
  ) {
    if (!interviewId) return;
    const res = await fetch(
      `/api/applications/${applicationId}/interviews/${interviewId}/video-metrics`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          consentAccepted: true,
          candidateInformed: true,
          source,
          durationSec,
          samples,
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not save video metrics");
    }
    const parsed = parseVideoBehavioralMetrics(data.videoBehavioralMetrics);
    if (parsed) setMetrics(parsed);
    router.refresh();
  }

  async function startWebcamCapture() {
    if (!canCapture) return;
    setLoading(true);
    setError(null);
    setSampleCount(0);
    try {
      const { samples, source } = await captureWebcamSamples({
        durationSec: 20,
        onSample: setSampleCount,
      });
      const durationSec = samples[samples.length - 1]?.atSec ?? 20;
      await submitSamples(samples, source, Math.max(durationSec, 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Webcam capture failed");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeRecording() {
    if (!canCapture || !recordingPath || !isVideoRecordingPath(recordingPath)) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/applications/${applicationId}/interviews/${interviewId}/recording`;
      const { samples, source } = await captureRecordingUrlSamples(url, { maxSamples: 20 });
      const durationSec = samples[samples.length - 1]?.atSec ?? 1;
      await submitSamples(samples, source, Math.max(durationSec, 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-brand/30 bg-brand/5 p-4">
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-brand" />
          Video behavioral metrics
          <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
            Opt-in required
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted">{VIDEO_ETHICAL_NOTICE}</p>
      </div>

      <div className="mb-4 space-y-2 rounded-lg border border-border-subtle bg-card p-3 text-sm">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
          />
          <span>
            I enable video behavioral analysis for this interview session (aggregated metrics only —
            no raw frames stored).
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={candidateInformed}
            onChange={(e) => setCandidateInformed(e.target.checked)}
          />
          <span>
            I confirm the candidate was informed and agreed to optional on-camera engagement
            analysis.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="h-8 px-3 text-xs"
          disabled={loading || !canCapture}
          onClick={startWebcamCapture}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Video className="h-4 w-4" />
              Capture live (20s)
            </>
          )}
        </Button>
        {isVideoRecordingPath(recordingPath) && (
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={loading || !canCapture}
            onClick={analyzeRecording}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <VideoOff className="h-4 w-4" />
                Analyze video recording
              </>
            )}
          </Button>
        )}
      </div>

      {loading && sampleCount > 0 && (
        <p className="mt-2 text-xs text-muted">Sampling… {sampleCount} frames captured</p>
      )}

      {metrics && (
        <div className="mt-4">
          <VideoBehavioralPanel metrics={metrics} />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-risk">{error}</p>}
    </section>
  );
}
