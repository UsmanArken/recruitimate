/// Pure aggregation helpers for org hiring analytics + fairness reporting.
/// Kept DB-free so they can be unit tested directly.

export type FunnelStageCount = { stage: string; count: number };

export function summarizeFunnel(
  stages: string[],
  order: readonly string[]
): FunnelStageCount[] {
  const counts = new Map<string, number>();
  for (const s of stages) counts.set(s, (counts.get(s) ?? 0) + 1);
  return order.map((stage) => ({ stage, count: counts.get(stage) ?? 0 }));
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type TimeToHire = {
  count: number;
  averageDays: number | null;
  medianDays: number | null;
  fastestDays: number | null;
  slowestDays: number | null;
};

export function computeTimeToHire(
  pairs: { createdAt: Date; recordedAt: Date }[]
): TimeToHire {
  const days = pairs
    .map((p) => (p.recordedAt.getTime() - p.createdAt.getTime()) / MS_PER_DAY)
    .filter((d) => Number.isFinite(d) && d >= 0)
    .sort((a, b) => a - b);

  if (days.length === 0) {
    return { count: 0, averageDays: null, medianDays: null, fastestDays: null, slowestDays: null };
  }

  const sum = days.reduce((a, b) => a + b, 0);
  const mid = Math.floor(days.length / 2);
  const median =
    days.length % 2 === 0 ? (days[mid - 1] + days[mid]) / 2 : days[mid];

  const round1 = (n: number) => Math.round(n * 10) / 10;
  return {
    count: days.length,
    averageDays: round1(sum / days.length),
    medianDays: round1(median),
    fastestDays: round1(days[0]),
    slowestDays: round1(days[days.length - 1]),
  };
}

const POSITIVE_RECS = new Set(["strong_yes", "yes"]);
const NEGATIVE_RECS = new Set(["no", "strong_no"]);

export type RecommendationAccuracy = {
  evaluated: number;
  correct: number;
  accuracy: number | null;
};

/// How often a directional recommendation matched the eventual good/bad hire.
export function computeRecommendationAccuracy(
  samples: { recommendation: string | null; success: boolean }[]
): RecommendationAccuracy {
  let evaluated = 0;
  let correct = 0;
  for (const s of samples) {
    if (!s.recommendation) continue;
    const isPositive = POSITIVE_RECS.has(s.recommendation);
    const isNegative = NEGATIVE_RECS.has(s.recommendation);
    if (!isPositive && !isNegative) continue;
    evaluated += 1;
    if ((isPositive && s.success) || (isNegative && !s.success)) correct += 1;
  }
  return {
    evaluated,
    correct,
    accuracy: evaluated > 0 ? correct / evaluated : null,
  };
}

export type InterviewerQualitySample = {
  biasRiskScore?: number | null;
  coverageScore?: number | null;
  probingScore?: number | null;
  biasFlags?: { label?: string }[] | null;
};

export type FairnessReport = {
  interviewsAnalyzed: number;
  interviewsWithBiasFlags: number;
  averageBiasRisk: number | null;
  averageCoverage: number | null;
  averageProbing: number | null;
  riskBuckets: { low: number; medium: number; high: number };
  topBiasFlags: { label: string; count: number }[];
};

function avg(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

/// Aggregate advisory interviewer-bias indicators across many interviews.
export function aggregateBias(
  samples: InterviewerQualitySample[]
): FairnessReport {
  const biasScores: number[] = [];
  const coverageScores: number[] = [];
  const probingScores: number[] = [];
  const buckets = { low: 0, medium: 0, high: 0 };
  const flagCounts = new Map<string, number>();
  let interviewsWithBiasFlags = 0;

  for (const s of samples) {
    if (typeof s.biasRiskScore === "number") {
      biasScores.push(s.biasRiskScore);
      if (s.biasRiskScore >= 0.5) buckets.high += 1;
      else if (s.biasRiskScore >= 0.25) buckets.medium += 1;
      else buckets.low += 1;
    }
    if (typeof s.coverageScore === "number") coverageScores.push(s.coverageScore);
    if (typeof s.probingScore === "number") probingScores.push(s.probingScore);

    const flags = (s.biasFlags ?? []).filter((f) => f?.label?.trim());
    if (flags.length > 0) interviewsWithBiasFlags += 1;
    for (const f of flags) {
      const label = f.label!.trim();
      flagCounts.set(label, (flagCounts.get(label) ?? 0) + 1);
    }
  }

  const topBiasFlags = [...flagCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    interviewsAnalyzed: samples.length,
    interviewsWithBiasFlags,
    averageBiasRisk: avg(biasScores),
    averageCoverage: avg(coverageScores),
    averageProbing: avg(probingScores),
    riskBuckets: buckets,
    topBiasFlags,
  };
}
