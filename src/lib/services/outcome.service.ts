import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { RecordOutcomeInput } from "@/lib/validators/learning";

type SignalSnapshot = {
  hireConfidence: number | null;
  talentScore: number | null;
  interviewScore: number | null;
  assessmentScore: number | null;
  recommendation: string | null;
};

function snapshotFromDecision(decision: {
  hireConfidence: number | null;
  recommendation: string | null;
  signalBreakdown: unknown;
} | null): SignalSnapshot {
  if (!decision) {
    return {
      hireConfidence: null,
      talentScore: null,
      interviewScore: null,
      assessmentScore: null,
      recommendation: null,
    };
  }
  const breakdown = (decision.signalBreakdown ?? {}) as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" ? v : null);
  const weight = (v: unknown) => (typeof v === "number" ? v : 0);
  // A signal that carried no weight wasn't really present — store null, not 0,
  // so it doesn't pollute later retraining.
  const present = (score: unknown, w: unknown) =>
    weight(w) > 0 ? num(score) : null;
  return {
    hireConfidence: decision.hireConfidence ?? null,
    talentScore: present(breakdown.talentScore, breakdown.talentWeight),
    interviewScore: present(breakdown.interviewScore, breakdown.interviewWeight),
    assessmentScore: present(breakdown.assessmentScore, breakdown.assessmentWeight),
    recommendation: decision.recommendation ?? null,
  };
}

export async function getOutcome(ctx: AuthContext, applicationId: string) {
  await assertPermission(ctx, { resource: "learning", action: "read" });
  await assertApplicationAccess(ctx, applicationId);
  return db.hiringOutcome.findUnique({
    where: { applicationId },
    include: { recordedBy: { select: { id: true, name: true, email: true } } },
  });
}

export async function recordOutcome(
  ctx: AuthContext,
  applicationId: string,
  input: RecordOutcomeInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "learning", action: "manage" });
  await assertApplicationAccess(ctx, applicationId);

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    select: { id: true, organizationId: true, decision: true },
  });
  if (!application) throw notFound("Application");

  const snapshot = snapshotFromDecision(application.decision);
  const onboardingStatus = input.onboardingStatus ?? "PENDING";

  return db.hiringOutcome.upsert({
    where: { applicationId },
    create: {
      organizationId: application.organizationId,
      applicationId,
      status: input.status,
      onboardingStatus,
      notes: input.notes ?? null,
      recordedById: ctx.userId,
      ...snapshot,
    },
    update: {
      status: input.status,
      onboardingStatus,
      notes: input.notes ?? null,
      recordedById: ctx.userId,
    },
    include: { recordedBy: { select: { id: true, name: true, email: true } } },
  });
}
