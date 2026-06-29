import {
  DEFAULT_LEARNED_WEIGHTS,
  type DecisionWeights,
} from "@/lib/intelligence/decision/weights";

/// One closed application used as a training example.
export type OutcomeSample = {
  talentScore: number | null;
  interviewScore: number | null;
  assessmentScore: number | null;
  /// True when the hire turned out well (good hire), false otherwise.
  success: boolean;
};

export type SignalStrength = {
  talent: number | null;
  interview: number | null;
  assessment: number | null;
};

export type RetrainResult = {
  weights: DecisionWeights;
  sampleSize: number;
  positiveLabels: number;
  confidence: number;
  signalStrength: SignalStrength;
  notes: string;
};

const SIGNAL_KEYS = ["talent", "interview", "assessment"] as const;
type SignalKey = (typeof SIGNAL_KEYS)[number];

/// Samples needed before the learned model fully replaces the prior.
export const FULL_CONFIDENCE_SAMPLES = 25;
/// Minimum labelled points (with both classes) before a signal is trusted.
const MIN_SIGNAL_SAMPLES = 4;
/// Floor so no signal is ever fully zeroed out by learning.
const MIN_WEIGHT = 0.05;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function scoreFor(sample: OutcomeSample, key: SignalKey): number | null {
  if (key === "talent") return sample.talentScore;
  if (key === "interview") return sample.interviewScore;
  return sample.assessmentScore;
}

/// Predictive strength: how much higher this signal runs for good hires vs bad.
function computeSignalStrength(
  samples: OutcomeSample[],
  key: SignalKey
): number | null {
  const positives: number[] = [];
  const negatives: number[] = [];
  for (const s of samples) {
    const v = scoreFor(s, key);
    if (v == null) continue;
    (s.success ? positives : negatives).push(v);
  }
  if (positives.length + negatives.length < MIN_SIGNAL_SAMPLES) return null;
  if (positives.length === 0 || negatives.length === 0) return null;

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return clamp01(mean(positives) - mean(negatives));
}

function normalize(weights: DecisionWeights): DecisionWeights {
  const sum = weights.talent + weights.interview + weights.assessment;
  if (sum <= 0) return { ...DEFAULT_LEARNED_WEIGHTS };
  return {
    talent: weights.talent / sum,
    interview: weights.interview / sum,
    assessment: weights.assessment / sum,
  };
}

/**
 * Retrain decision-layer weights from observed hiring outcomes.
 *
 * Strategy (explainable, never black-box):
 *  - Measure each signal's predictive strength (mean score gap between good and
 *    bad hires).
 *  - Redistribute the prior weight mass of *trusted* signals in proportion to
 *    their strength; untrusted signals (too few samples) keep their prior.
 *  - Blend toward the prior based on overall sample-size confidence so small
 *    datasets barely move the model.
 */
export function retrainWeights(
  samples: OutcomeSample[],
  prior: DecisionWeights = DEFAULT_LEARNED_WEIGHTS
): RetrainResult {
  const sampleSize = samples.length;
  const positiveLabels = samples.filter((s) => s.success).length;

  const signalStrength: SignalStrength = {
    talent: computeSignalStrength(samples, "talent"),
    interview: computeSignalStrength(samples, "interview"),
    assessment: computeSignalStrength(samples, "assessment"),
  };

  const confidence = clamp01(sampleSize / FULL_CONFIDENCE_SAMPLES);

  if (sampleSize === 0 || positiveLabels === 0 || positiveLabels === sampleSize) {
    return {
      weights: normalize(prior),
      sampleSize,
      positiveLabels,
      confidence: 0,
      signalStrength,
      notes:
        sampleSize === 0
          ? "No closed outcomes yet — using default weights."
          : "Outcomes are all one class (no contrast) — keeping prior weights.",
    };
  }

  const trusted = SIGNAL_KEYS.filter((k) => signalStrength[k] != null);
  const priorMassTrusted = trusted.reduce((sum, k) => sum + prior[k], 0);
  const strengthSum = trusted.reduce((sum, k) => sum + (signalStrength[k] ?? 0), 0);

  const target: DecisionWeights = { ...prior };
  if (trusted.length > 0 && strengthSum > 0) {
    for (const k of trusted) {
      target[k] = priorMassTrusted * ((signalStrength[k] ?? 0) / strengthSum);
    }
  }

  let blended: DecisionWeights = {
    talent: prior.talent * (1 - confidence) + target.talent * confidence,
    interview: prior.interview * (1 - confidence) + target.interview * confidence,
    assessment: prior.assessment * (1 - confidence) + target.assessment * confidence,
  };

  blended = {
    talent: Math.max(blended.talent, MIN_WEIGHT),
    interview: Math.max(blended.interview, MIN_WEIGHT),
    assessment: Math.max(blended.assessment, MIN_WEIGHT),
  };

  const weights = normalize(blended);

  const notes = trusted.length
    ? `Retrained from ${sampleSize} outcomes (${positiveLabels} good hires). Trusted signals: ${trusted.join(", ")}.`
    : `Not enough contrast per signal across ${sampleSize} outcomes — weights stay close to prior.`;

  return {
    weights,
    sampleSize,
    positiveLabels,
    confidence,
    signalStrength,
    notes,
  };
}

/// Map a recorded outcome to a binary "good hire" training label.
export function isGoodHire(input: {
  status: string;
  onboardingStatus: string;
}): boolean | null {
  if (input.status === "HIRED") {
    if (input.onboardingStatus === "SUCCESSFUL") return true;
    if (input.onboardingStatus === "STRUGGLING" || input.onboardingStatus === "LEFT") {
      return false;
    }
    // Hired but onboarding still pending — treat as tentatively positive.
    return true;
  }
  if (input.status === "REJECTED") return false;
  // Withdrawn / offer declined are not driven by our recommendation quality.
  return null;
}
