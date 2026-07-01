import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertCandidateAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { modelCareerTrajectory } from "@/lib/intelligence/talent/career-trajectory-engine";
import type { CareerTrajectoryResult } from "@/lib/intelligence/types";

export async function getCareerTrajectory(
  ctx: AuthContext,
  candidateId: string
): Promise<CareerTrajectoryResult | null> {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  await assertCandidateAccess(ctx, candidateId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    select: { careerTrajectory: true },
  });
  if (!candidate?.careerTrajectory) return null;
  return candidate.careerTrajectory as unknown as CareerTrajectoryResult;
}

export async function computeAndStoreCareerTrajectory(
  ctx: AuthContext,
  candidateId: string
): Promise<CareerTrajectoryResult> {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  await assertCandidateAccess(ctx, candidateId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
  });
  if (!candidate) throw notFound("Candidate");

  const profileText = buildCandidateIntelligenceText(candidate);
  const trajectory = modelCareerTrajectory(profileText);

  await db.candidate.update({
    where: { id: candidateId },
    data: {
      careerTrajectory: trajectory as unknown as Prisma.InputJsonValue,
      careerTrajectoryComputedAt: new Date(),
    },
  });

  return trajectory;
}

export async function ensureCareerTrajectory(
  ctx: AuthContext,
  candidateId: string
): Promise<CareerTrajectoryResult> {
  const existing = await getCareerTrajectory(ctx, candidateId);
  if (existing) return existing;
  return computeAndStoreCareerTrajectory(ctx, candidateId);
}
