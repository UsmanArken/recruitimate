import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import {
  DEFAULT_LEARNED_WEIGHTS,
  type DecisionWeights,
} from "@/lib/intelligence/decision/weights";
import {
  isGoodHire,
  retrainWeights,
  type OutcomeSample,
} from "@/lib/intelligence/learning/retrain-engine";

/// Active learned weights for an org, or null when no model has been trained.
export async function getActiveWeights(
  organizationId: string | null | undefined
): Promise<DecisionWeights | null> {
  if (!organizationId) return null;
  const model = await db.scoringModelWeights.findFirst({
    where: { organizationId, active: true },
    orderBy: { trainedAt: "desc" },
  });
  if (!model) return null;
  return {
    talent: model.talentWeight,
    interview: model.interviewWeight,
    assessment: model.assessmentWeight,
  };
}

async function buildSamples(organizationId: string): Promise<OutcomeSample[]> {
  const outcomes = await db.hiringOutcome.findMany({
    where: { organizationId },
    select: {
      status: true,
      onboardingStatus: true,
      talentScore: true,
      interviewScore: true,
      assessmentScore: true,
    },
  });

  const samples: OutcomeSample[] = [];
  for (const o of outcomes) {
    const label = isGoodHire({ status: o.status, onboardingStatus: o.onboardingStatus });
    if (label == null) continue;
    samples.push({
      talentScore: o.talentScore,
      interviewScore: o.interviewScore,
      assessmentScore: o.assessmentScore,
      success: label,
    });
  }
  return samples;
}

export async function getScoringModel(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "learning", action: "read" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const [model, samples, totalOutcomes] = await Promise.all([
    organizationId
      ? db.scoringModelWeights.findFirst({
          where: { organizationId, active: true },
          orderBy: { trainedAt: "desc" },
        })
      : null,
    organizationId ? buildSamples(organizationId) : Promise.resolve([]),
    organizationId
      ? db.hiringOutcome.count({ where: { organizationId } })
      : Promise.resolve(0),
  ]);

  return {
    model,
    defaultWeights: DEFAULT_LEARNED_WEIGHTS,
    trainableSamples: samples.length,
    totalOutcomes,
  };
}

export async function retrainScoringModel(ctx: AuthContext) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "learning", action: "manage" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  if (!organizationId) {
    throw new Error("An organization context is required to retrain the model");
  }

  const samples = await buildSamples(organizationId);
  const result = retrainWeights(samples);

  const metadata: Prisma.InputJsonValue = {
    confidence: result.confidence,
    signalStrength: result.signalStrength,
    notes: result.notes,
    retrainedBy: ctx.userId,
  };

  const previous = await db.scoringModelWeights.findFirst({
    where: { organizationId, active: true },
    orderBy: { version: "desc" },
  });
  const nextVersion = (previous?.version ?? 0) + 1;

  const [, model] = await db.$transaction([
    db.scoringModelWeights.updateMany({
      where: { organizationId, active: true },
      data: { active: false },
    }),
    db.scoringModelWeights.create({
      data: {
        organizationId,
        version: nextVersion,
        active: true,
        talentWeight: result.weights.talent,
        interviewWeight: result.weights.interview,
        assessmentWeight: result.weights.assessment,
        sampleSize: result.sampleSize,
        positiveLabels: result.positiveLabels,
        metadata,
      },
    }),
  ]);

  return { model, result };
}
