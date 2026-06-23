import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregateVideoBehavioralMetrics } from "../../src/lib/intelligence/video/video-behavioral-engine";

describe("Video behavioral metrics aggregation", () => {
  it("computes engagement and face visibility from samples", () => {
    const result = aggregateVideoBehavioralMetrics({
      source: "webcam_live",
      durationSec: 20,
      consentAt: new Date("2026-06-10T12:00:00Z"),
      candidateInformed: true,
      samples: [
        { atSec: 1, faceDetected: true, engagement: 0.8, attention: 0.7 },
        { atSec: 2, faceDetected: true, engagement: 0.75, attention: 0.65 },
        { atSec: 3, faceDetected: false, engagement: 0.3, attention: 0.2 },
        { atSec: 4, faceDetected: true, engagement: 0.7, attention: 0.6 },
      ],
    });

    assert.equal(result.consentGiven, true);
    assert.equal(result.candidateInformed, true);
    assert.equal(result.faceVisiblePercent, 75);
    assert.ok(result.engagementScore > 0.5);
    assert.ok(result.attentionScore > 0.4);
    assert.ok(result.ethicalNotice.includes("consent"));
  });

  it("flags low engagement when face rarely visible", () => {
    const result = aggregateVideoBehavioralMetrics({
      source: "motion_fallback",
      durationSec: 15,
      consentAt: new Date(),
      candidateInformed: true,
      samples: [
        { atSec: 1, faceDetected: false, engagement: 0.2, attention: 0.2 },
        { atSec: 2, faceDetected: false, engagement: 0.25, attention: 0.15 },
        { atSec: 3, faceDetected: true, engagement: 0.35, attention: 0.3 },
      ],
    });

    assert.ok(result.faceVisiblePercent < 50);
    assert.ok(
      result.signals.some((s) => s.label.toLowerCase().includes("face") || s.label.toLowerCase().includes("engagement"))
    );
  });
});
