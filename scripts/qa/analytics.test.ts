import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  predictHiringSuccess,
  type PredictionSample,
} from "../../src/lib/intelligence/learning/success-prediction";
import {
  aggregateBias,
  computeRecommendationAccuracy,
  computeTimeToHire,
  summarizeFunnel,
} from "../../src/lib/intelligence/analytics/aggregate";

describe("predictHiringSuccess", () => {
  it("uses hire confidence as a provisional estimate with no history", () => {
    const res = predictHiringSuccess(0.8, []);
    assert.equal(res.probability, 0.8);
    assert.equal(res.confidence, "low");
    assert.equal(res.basis.historicalSamples, 0);
  });

  it("returns null probability when nothing to predict from", () => {
    const res = predictHiringSuccess(null, []);
    assert.equal(res.probability, null);
  });

  it("falls back to base rate when candidate has no score", () => {
    const samples: PredictionSample[] = [
      { score: 0.8, success: true },
      { score: 0.7, success: true },
      { score: 0.3, success: false },
      { score: 0.2, success: false },
    ];
    const res = predictHiringSuccess(null, samples);
    assert.equal(res.probability, 0.5);
  });

  it("predicts higher for scores near successful historical hires", () => {
    const samples: PredictionSample[] = [];
    for (let i = 0; i < 30; i++) {
      // High scores succeeded, low scores failed.
      samples.push({ score: 0.85, success: true });
      samples.push({ score: 0.2, success: false });
    }
    const high = predictHiringSuccess(0.85, samples);
    const low = predictHiringSuccess(0.2, samples);
    assert.ok(high.probability! > low.probability!);
    assert.ok(high.probability! > 0.7);
    assert.ok(low.probability! < 0.3);
    assert.equal(high.confidence, "high");
  });

  it("keeps probability within [0,1]", () => {
    const samples: PredictionSample[] = [
      { score: 1, success: true },
      { score: 0, success: false },
    ];
    const res = predictHiringSuccess(1, samples);
    assert.ok(res.probability! >= 0 && res.probability! <= 1);
  });
});

describe("summarizeFunnel", () => {
  it("counts stages in the provided order", () => {
    const funnel = summarizeFunnel(
      ["NEW", "NEW", "HIRED"],
      ["NEW", "INTERVIEWED", "HIRED"]
    );
    assert.deepEqual(funnel, [
      { stage: "NEW", count: 2 },
      { stage: "INTERVIEWED", count: 0 },
      { stage: "HIRED", count: 1 },
    ]);
  });
});

describe("computeTimeToHire", () => {
  it("computes average and median days", () => {
    const day = 24 * 60 * 60 * 1000;
    const base = new Date("2026-01-01T00:00:00Z");
    const res = computeTimeToHire([
      { createdAt: base, recordedAt: new Date(base.getTime() + 10 * day) },
      { createdAt: base, recordedAt: new Date(base.getTime() + 20 * day) },
      { createdAt: base, recordedAt: new Date(base.getTime() + 30 * day) },
    ]);
    assert.equal(res.count, 3);
    assert.equal(res.averageDays, 20);
    assert.equal(res.medianDays, 20);
    assert.equal(res.fastestDays, 10);
    assert.equal(res.slowestDays, 30);
  });

  it("returns nulls with no hires", () => {
    const res = computeTimeToHire([]);
    assert.equal(res.count, 0);
    assert.equal(res.averageDays, null);
  });
});

describe("computeRecommendationAccuracy", () => {
  it("scores directional recommendations against outcomes", () => {
    const res = computeRecommendationAccuracy([
      { recommendation: "strong_yes", success: true }, // correct
      { recommendation: "yes", success: false }, // wrong
      { recommendation: "no", success: false }, // correct
      { recommendation: "maybe", success: true }, // ignored
      { recommendation: null, success: true }, // ignored
    ]);
    assert.equal(res.evaluated, 3);
    assert.equal(res.correct, 2);
    assert.ok(Math.abs(res.accuracy! - 2 / 3) < 1e-9);
  });
});

describe("aggregateBias", () => {
  it("aggregates bias risk, buckets, and top flags across interviews", () => {
    const report = aggregateBias([
      { biasRiskScore: 0.6, coverageScore: 0.8, probingScore: 0.5, biasFlags: [{ label: "Leading prompt" }] },
      { biasRiskScore: 0.3, coverageScore: 0.6, probingScore: 0.4, biasFlags: [{ label: "Leading prompt" }] },
      { biasRiskScore: 0.1, coverageScore: 0.9, probingScore: 0.7, biasFlags: [] },
    ]);
    assert.equal(report.interviewsAnalyzed, 3);
    assert.equal(report.interviewsWithBiasFlags, 2);
    assert.equal(report.riskBuckets.high, 1);
    assert.equal(report.riskBuckets.medium, 1);
    assert.equal(report.riskBuckets.low, 1);
    assert.equal(report.topBiasFlags[0].label, "Leading prompt");
    assert.equal(report.topBiasFlags[0].count, 2);
    assert.ok(Math.abs((report.averageBiasRisk ?? 0) - 0.3333333333333333) < 1e-9);
  });

  it("handles no interviews", () => {
    const report = aggregateBias([]);
    assert.equal(report.interviewsAnalyzed, 0);
    assert.equal(report.averageBiasRisk, null);
    assert.deepEqual(report.topBiasFlags, []);
  });
});
