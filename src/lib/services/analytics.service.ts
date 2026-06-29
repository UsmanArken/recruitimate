import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/permission.service";
import {
  metricsApplicationsWhereClause,
  metricsCandidatesWhereClause,
  metricsJobsWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { PIPELINE_STAGE_IDS, pipelineStageLabel } from "@/lib/pipeline/stages";
import { isGoodHire } from "@/lib/intelligence/learning/retrain-engine";
import {
  aggregateBias,
  computeRecommendationAccuracy,
  computeTimeToHire,
  summarizeFunnel,
  type InterviewerQualitySample,
} from "@/lib/intelligence/analytics/aggregate";

export async function getHiringAnalytics(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "decisions", action: "read" });

  const [applicationWhere, candidateWhere, jobWhere] = await Promise.all([
    metricsApplicationsWhereClause(ctx),
    metricsCandidatesWhereClause(ctx),
    metricsJobsWhereClause(ctx),
  ]);

  const [
    candidateCount,
    jobCount,
    applications,
    decisions,
    outcomes,
    interviewAnalyses,
  ] = await Promise.all([
    db.candidate.count({ where: candidateWhere }),
    db.job.count({ where: jobWhere }),
    db.jobApplication.findMany({
      where: applicationWhere,
      select: { id: true, stage: true, createdAt: true },
    }),
    db.decision.findMany({
      where: { application: applicationWhere, hireConfidence: { not: null } },
      select: { hireConfidence: true },
    }),
    db.hiringOutcome.findMany({
      where: { application: applicationWhere },
      select: {
        status: true,
        onboardingStatus: true,
        recommendation: true,
        recordedAt: true,
        application: { select: { createdAt: true } },
      },
    }),
    db.interviewAnalysis.findMany({
      where: { interview: { application: applicationWhere } },
      select: { interviewerQuality: true },
    }),
  ]);

  // ── Funnel (P3-005) ──────────────────────────────────────────────
  const funnel = summarizeFunnel(
    applications.map((a) => a.stage),
    PIPELINE_STAGE_IDS
  ).map((row) => ({ ...row, label: pipelineStageLabel(row.stage) }));

  // ── Quality (P3-005) ─────────────────────────────────────────────
  const avgConfidence =
    decisions.length > 0
      ? decisions.reduce((s, d) => s + (d.hireConfidence ?? 0), 0) / decisions.length
      : null;

  // ── Outcomes + good-hire rate (P3-005) ───────────────────────────
  const outcomeCounts = { HIRED: 0, REJECTED: 0, WITHDRAWN: 0, OFFER_DECLINED: 0 };
  const labelSamples: { recommendation: string | null; success: boolean }[] = [];
  let goodHires = 0;
  let labelledHires = 0;
  for (const o of outcomes) {
    outcomeCounts[o.status] = (outcomeCounts[o.status] ?? 0) + 1;
    const label = isGoodHire({ status: o.status, onboardingStatus: o.onboardingStatus });
    if (label != null) {
      labelSamples.push({ recommendation: o.recommendation, success: label });
      labelledHires += 1;
      if (label) goodHires += 1;
    }
  }
  const goodHireRate = labelledHires > 0 ? goodHires / labelledHires : null;

  // ── Time-to-hire (P3-005) ────────────────────────────────────────
  const timeToHire = computeTimeToHire(
    outcomes
      .filter((o) => o.status === "HIRED")
      .map((o) => ({ createdAt: o.application.createdAt, recordedAt: o.recordedAt }))
  );

  // ── Recommendation accuracy (P3-002 × P3-001) ────────────────────
  const recommendationAccuracy = computeRecommendationAccuracy(labelSamples);

  // ── Fairness / bias (P3-006) ─────────────────────────────────────
  const qualitySamples: InterviewerQualitySample[] = [];
  for (const analysis of interviewAnalyses) {
    const q = analysis.interviewerQuality;
    if (!q || typeof q !== "object" || Array.isArray(q)) continue;
    const record = q as Record<string, unknown>;
    qualitySamples.push({
      biasRiskScore: typeof record.biasRiskScore === "number" ? record.biasRiskScore : null,
      coverageScore: typeof record.coverageScore === "number" ? record.coverageScore : null,
      probingScore: typeof record.probingScore === "number" ? record.probingScore : null,
      biasFlags: Array.isArray(record.biasFlags)
        ? (record.biasFlags as { label?: string }[])
        : [],
    });
  }
  const fairness = aggregateBias(qualitySamples);

  return {
    overview: {
      candidates: candidateCount,
      jobs: jobCount,
      applications: applications.length,
      avgConfidence,
      outcomesRecorded: outcomes.length,
      goodHireRate,
    },
    funnel,
    outcomeCounts,
    timeToHire,
    recommendationAccuracy,
    fairness,
  };
}
