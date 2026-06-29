import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  retrainWeights,
  isGoodHire,
  type OutcomeSample,
} from "../../src/lib/intelligence/learning/retrain-engine";
import {
  blendDecisionScores,
  DEFAULT_LEARNED_WEIGHTS,
} from "../../src/lib/intelligence/decision/weights";
import {
  recordOutcomeSchema,
  recommendationFeedbackSchema,
} from "../../src/lib/validators/learning";

function approxSum(w: { talent: number; interview: number; assessment: number }) {
  return w.talent + w.interview + w.assessment;
}

describe("isGoodHire labelling", () => {
  it("treats successful onboarding as a good hire", () => {
    assert.equal(isGoodHire({ status: "HIRED", onboardingStatus: "SUCCESSFUL" }), true);
  });
  it("treats hired-but-left as a bad hire", () => {
    assert.equal(isGoodHire({ status: "HIRED", onboardingStatus: "LEFT" }), false);
  });
  it("treats rejection as a negative label", () => {
    assert.equal(isGoodHire({ status: "REJECTED", onboardingStatus: "PENDING" }), false);
  });
  it("excludes withdrawals (not driven by recommendation quality)", () => {
    assert.equal(isGoodHire({ status: "WITHDRAWN", onboardingStatus: "PENDING" }), null);
    assert.equal(isGoodHire({ status: "OFFER_DECLINED", onboardingStatus: "PENDING" }), null);
  });
});

describe("retrainWeights", () => {
  it("returns prior weights with no samples", () => {
    const res = retrainWeights([]);
    assert.deepEqual(res.weights, DEFAULT_LEARNED_WEIGHTS);
    assert.equal(res.sampleSize, 0);
    assert.equal(res.confidence, 0);
  });

  it("keeps prior when outcomes are all one class", () => {
    const samples: OutcomeSample[] = Array.from({ length: 10 }, () => ({
      talentScore: 0.8,
      interviewScore: 0.8,
      assessmentScore: 0.8,
      success: true,
    }));
    const res = retrainWeights(samples);
    assert.equal(res.positiveLabels, 10);
    assert.deepEqual(res.weights, DEFAULT_LEARNED_WEIGHTS);
  });

  it("always returns normalized weights that sum to ~1", () => {
    const samples: OutcomeSample[] = [
      { talentScore: 0.9, interviewScore: 0.4, assessmentScore: 0.5, success: true },
      { talentScore: 0.2, interviewScore: 0.5, assessmentScore: 0.5, success: false },
      { talentScore: 0.85, interviewScore: 0.45, assessmentScore: 0.5, success: true },
      { talentScore: 0.3, interviewScore: 0.55, assessmentScore: 0.5, success: false },
    ];
    const res = retrainWeights(samples);
    assert.ok(Math.abs(approxSum(res.weights) - 1) < 1e-9);
  });

  it("shifts weight toward the signal that best separates good and bad hires", () => {
    // Talent perfectly predicts success; interview is noise.
    const samples: OutcomeSample[] = [];
    for (let i = 0; i < 40; i++) {
      const success = i % 2 === 0;
      samples.push({
        talentScore: success ? 0.95 : 0.1,
        interviewScore: 0.5,
        assessmentScore: success ? 0.6 : 0.5,
        success,
      });
    }
    const res = retrainWeights(samples);
    assert.ok(
      res.weights.talent > DEFAULT_LEARNED_WEIGHTS.talent,
      `expected talent weight to grow, got ${res.weights.talent}`
    );
    assert.ok(res.weights.talent > res.weights.interview);
    assert.equal(res.confidence, 1);
  });

  it("barely moves from prior with a tiny dataset", () => {
    const samples: OutcomeSample[] = [
      { talentScore: 0.9, interviewScore: 0.3, assessmentScore: 0.5, success: true },
      { talentScore: 0.2, interviewScore: 0.6, assessmentScore: 0.5, success: false },
    ];
    const res = retrainWeights(samples);
    assert.ok(res.confidence < 0.2);
    assert.ok(Math.abs(res.weights.talent - DEFAULT_LEARNED_WEIGHTS.talent) < 0.1);
  });
});

describe("blendDecisionScores with learned weights", () => {
  it("uses learned weights and renormalizes to available signals", () => {
    const { hireConfidence, weights } = blendDecisionScores({
      talentScore: 1,
      interviewScore: 0,
      assessmentScore: 0,
      hasInterview: false,
      hasAssessment: false,
      learnedWeights: { talent: 0.5, interview: 0.3, assessment: 0.2 },
    });
    assert.equal(weights.talent, 1);
    assert.equal(hireConfidence, 1);
  });

  it("falls back to defaults when no learned weights provided", () => {
    const { weights } = blendDecisionScores({
      talentScore: 0.5,
      interviewScore: 0.5,
      assessmentScore: 0.5,
      hasInterview: true,
      hasAssessment: true,
    });
    assert.equal(weights.talent, 0.3);
    assert.equal(weights.interview, 0.4);
    assert.equal(weights.assessment, 0.3);
  });
});

describe("learning validators", () => {
  it("accepts a valid outcome payload", () => {
    const parsed = recordOutcomeSchema.parse({
      status: "HIRED",
      onboardingStatus: "SUCCESSFUL",
      notes: "Great ramp-up",
    });
    assert.equal(parsed.status, "HIRED");
  });

  it("rejects an invalid outcome status", () => {
    assert.throws(() => recordOutcomeSchema.parse({ status: "MAYBE" }));
  });

  it("accepts thumbs feedback", () => {
    assert.equal(recommendationFeedbackSchema.parse({ rating: "UP" }).rating, "UP");
    assert.throws(() => recommendationFeedbackSchema.parse({ rating: "MEH" }));
  });
});
