import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { isGoodHire } from "@/lib/intelligence/learning/retrain-engine";
import {
  predictHiringSuccess,
  type PredictionSample,
} from "@/lib/intelligence/learning/success-prediction";

/// Historical hires (with a confidence snapshot) used to calibrate prediction.
export async function loadPredictionSamples(
  organizationId: string
): Promise<PredictionSample[]> {
  const outcomes = await db.hiringOutcome.findMany({
    where: { organizationId, hireConfidence: { not: null } },
    select: { status: true, onboardingStatus: true, hireConfidence: true },
  });

  const samples: PredictionSample[] = [];
  for (const o of outcomes) {
    if (o.hireConfidence == null) continue;
    const label = isGoodHire({ status: o.status, onboardingStatus: o.onboardingStatus });
    if (label == null) continue;
    samples.push({ score: o.hireConfidence, success: label });
  }
  return samples;
}

export async function getApplicationSuccessPrediction(
  ctx: AuthContext,
  applicationId: string
) {
  await assertPermission(ctx, { resource: "decisions", action: "read" });
  await assertApplicationAccess(ctx, applicationId);

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    select: { id: true, organizationId: true, decision: { select: { hireConfidence: true } } },
  });
  if (!application) throw notFound("Application");

  const samples = await loadPredictionSamples(application.organizationId);
  const candidateScore = application.decision?.hireConfidence ?? null;

  return predictHiringSuccess(candidateScore, samples);
}
