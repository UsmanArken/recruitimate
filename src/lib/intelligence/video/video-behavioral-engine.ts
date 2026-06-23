import type {
  VideoBehavioralResult,
  VideoBehavioralSample,
  VideoBehavioralSource,
  Signal,
} from "../types";

export const VIDEO_ETHICAL_NOTICE =
  "Advisory engagement signals only — not deception detection. Requires explicit candidate consent. No raw video frames are stored.";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function aggregateVideoBehavioralMetrics(input: {
  source: VideoBehavioralSource;
  durationSec: number;
  samples: VideoBehavioralSample[];
  consentAt: Date;
  candidateInformed: boolean;
}): VideoBehavioralResult {
  const { samples, durationSec, source, consentAt, candidateInformed } = input;

  const faceVisiblePercent = round2(
    (samples.filter((s) => s.faceDetected).length / samples.length) * 100
  );

  const engagementScore = round2(
    samples.reduce((sum, s) => sum + s.engagement, 0) / samples.length
  );

  const attentionScore = round2(
    samples.reduce((sum, s) => sum + s.attention, 0) / samples.length
  );

  const movementScores = samples.map((s, i) => {
    if (i === 0) return 0;
    return Math.abs(s.engagement - samples[i - 1].engagement);
  });
  const movementScore = round2(
    movementScores.reduce((a, b) => a + b, 0) / Math.max(movementScores.length, 1)
  );

  const signals: Signal[] = [];

  if (faceVisiblePercent < 50) {
    signals.push({
      label: "Limited face visibility",
      value: `Face detected in ${faceVisiblePercent}% of samples`,
      evidence: "Camera angle, lighting, or candidate off-frame may limit metrics.",
      confidence: "medium",
    });
  } else if (faceVisiblePercent >= 80) {
    signals.push({
      label: "Consistent on-camera presence",
      value: `Face visible in ${faceVisiblePercent}% of samples`,
      evidence: "Stable camera presence during capture window.",
      confidence: "high",
    });
  }

  if (engagementScore >= 0.65) {
    signals.push({
      label: "Sustained engagement",
      value: "Engagement proxy remained moderate-to-high",
      evidence: `Average engagement score ${engagementScore}.`,
      confidence: "medium",
    });
  } else if (engagementScore < 0.4) {
    signals.push({
      label: "Low engagement proxy",
      value: "Limited visual engagement signals detected",
      evidence: "Consider environment distractions or camera issues before inferring disengagement.",
      confidence: "low",
    });
  }

  if (attentionScore < 0.45 && faceVisiblePercent > 40) {
    signals.push({
      label: "Attention drift",
      value: "Face present but attention proxy is low",
      evidence: "Candidate may be looking away from camera intermittently.",
      confidence: "low",
    });
  }

  if (movementScore > 0.25) {
    signals.push({
      label: "High movement variability",
      value: "Frequent shifts in visual engagement between samples",
      evidence: "Movement or gesture activity between sample intervals.",
      confidence: "medium",
    });
  }

  return {
    consentGiven: true,
    consentAt: consentAt.toISOString(),
    candidateInformed,
    source,
    durationSec: round2(durationSec),
    faceVisiblePercent,
    engagementScore,
    attentionScore,
    movementScore,
    sampleCount: samples.length,
    samples: samples.slice(0, 20),
    ethicalNotice: VIDEO_ETHICAL_NOTICE,
    signals,
    explanation: `Aggregated ${samples.length} visual samples over ${round2(durationSec)}s (${source}). Metrics are advisory proxies — not biometric truth claims.`,
  };
}
