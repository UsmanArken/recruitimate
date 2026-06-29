/// One historical hire used to calibrate the success predictor.
export type PredictionSample = {
  /// Blended hire-confidence the model assigned at the time (0-1).
  score: number;
  /// Whether the hire turned out well.
  success: boolean;
};

export type SuccessPrediction = {
  /// Predicted probability the candidate succeeds in role (0-1), or null when
  /// there is no signal at all to predict from.
  probability: number | null;
  confidence: "low" | "medium" | "high";
  basis: {
    historicalSamples: number;
    comparableSamples: number;
    baseRate: number | null;
  };
  explanation: string;
};

/// Score window for considering a past hire "comparable" to this candidate.
const COMPARABLE_BAND = 0.15;
/// Comparable hires needed before we lean fully on the local success rate.
const COMPARABLE_SATURATION = 6;
/// Total samples for high confidence.
const HIGH_CONFIDENCE_SAMPLES = 25;
/// Total samples for medium confidence.
const MEDIUM_CONFIDENCE_SAMPLES = 8;

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Predict a candidate's likelihood of succeeding in role.
 *
 * Transparent, evidence-based method (no black box):
 *  - Base rate = share of all past hires that succeeded.
 *  - Local rate = success share of past hires with a *similar* model score.
 *  - Blend local toward base by how many comparable hires we have, then nudge
 *    toward the candidate's own model score so brand-new score regions still
 *    move the needle.
 */
export function predictHiringSuccess(
  candidateScore: number | null,
  samples: PredictionSample[]
): SuccessPrediction {
  const historicalSamples = samples.length;

  if (historicalSamples === 0) {
    if (candidateScore == null) {
      return {
        probability: null,
        confidence: "low",
        basis: { historicalSamples: 0, comparableSamples: 0, baseRate: null },
        explanation:
          "No hire confidence and no historical outcomes yet — record outcomes to enable prediction.",
      };
    }
    return {
      probability: clamp01(candidateScore),
      confidence: "low",
      basis: { historicalSamples: 0, comparableSamples: 0, baseRate: null },
      explanation:
        "No historical outcomes yet — using current hire confidence as a provisional estimate.",
    };
  }

  const baseRate = mean(samples.map((s) => (s.success ? 1 : 0)));

  if (candidateScore == null) {
    return {
      probability: clamp01(baseRate),
      confidence: historicalSamples >= MEDIUM_CONFIDENCE_SAMPLES ? "medium" : "low",
      basis: { historicalSamples, comparableSamples: historicalSamples, baseRate },
      explanation: `No hire confidence for this candidate — showing your org's overall success rate (${Math.round(
        baseRate * 100
      )}%) from ${historicalSamples} past hires.`,
    };
  }

  const comparable = samples.filter(
    (s) => Math.abs(s.score - candidateScore) <= COMPARABLE_BAND
  );
  const comparableSamples = comparable.length;
  const localRate = comparableSamples > 0
    ? mean(comparable.map((s) => (s.success ? 1 : 0)))
    : baseRate;

  const localWeight = clamp01(comparableSamples / COMPARABLE_SATURATION);
  const calibrated = localWeight * localRate + (1 - localWeight) * baseRate;

  // Blend the history-calibrated estimate with the candidate's own score so a
  // very high/low score still shifts the prediction when history is thin.
  const scoreWeight = clamp01(historicalSamples / HIGH_CONFIDENCE_SAMPLES);
  const probability = clamp01(
    scoreWeight * calibrated + (1 - scoreWeight) * candidateScore
  );

  let confidence: SuccessPrediction["confidence"] = "low";
  if (historicalSamples >= HIGH_CONFIDENCE_SAMPLES && comparableSamples >= COMPARABLE_SATURATION) {
    confidence = "high";
  } else if (historicalSamples >= MEDIUM_CONFIDENCE_SAMPLES) {
    confidence = "medium";
  }

  const explanation = comparableSamples > 0
    ? `Based on ${comparableSamples} past hire${comparableSamples === 1 ? "" : "s"} with similar signals (${Math.round(
        localRate * 100
      )}% succeeded) and an overall ${Math.round(baseRate * 100)}% success rate across ${historicalSamples} outcomes.`
    : `No past hires with a similar score yet — blending your ${Math.round(
        baseRate * 100
      )}% base rate with this candidate's hire confidence across ${historicalSamples} outcomes.`;

  return {
    probability,
    confidence,
    basis: { historicalSamples, comparableSamples, baseRate },
    explanation,
  };
}
