import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { RecruiterReviewInput } from "@/lib/validators/recruiter-review";
import type { PipelineStage } from "@prisma/client";

function stageForTalentVerdict(verdict: RecruiterReviewInput["verdict"]): PipelineStage | undefined {
  if (verdict === "PASS") return "SHORTLISTED";
  if (verdict === "FAIL") return "REJECTED";
  if (verdict === "HOLD") return "TALENT_REVIEW";
  return undefined;
}

function stageForHireVerdict(verdict: RecruiterReviewInput["verdict"]): PipelineStage | undefined {
  if (verdict === "PASS") return "HIRED";
  if (verdict === "FAIL") return "REJECTED";
  if (verdict === "HOLD") return "DECISION";
  return undefined;
}

export async function saveRecruiterReview(
  ctx: AuthContext,
  applicationId: string,
  input: RecruiterReviewInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertApplicationAccess(ctx, applicationId);

  const now = new Date();
  const reviewedById = ctx.userId;

  const talentData =
    input.kind === "talent"
      ? {
          talentReviewVerdict: input.verdict,
          talentReviewNotes: input.notes?.trim() || null,
          talentReviewedAt: input.verdict === "PENDING" ? null : now,
          talentReviewedById: input.verdict === "PENDING" ? null : reviewedById,
        }
      : {};

  const hireData =
    input.kind === "hire"
      ? {
          hireReviewVerdict: input.verdict,
          hireReviewNotes: input.notes?.trim() || null,
          hireReviewedAt: input.verdict === "PENDING" ? null : now,
          hireReviewedById: input.verdict === "PENDING" ? null : reviewedById,
        }
      : {};

  const stageUpdate =
    input.kind === "talent"
      ? stageForTalentVerdict(input.verdict)
      : stageForHireVerdict(input.verdict);

  return db.jobApplication.update({
    where: { id: applicationId },
    data: {
      ...talentData,
      ...hireData,
      ...(stageUpdate ? { stage: stageUpdate } : {}),
    },
    include: {
      talentReviewedBy: { select: { id: true, name: true, email: true } },
      hireReviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getApplicationRecruiterReviews(ctx: AuthContext, applicationId: string) {
  await assertApplicationAccess(ctx, applicationId);
  const app = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    select: {
      talentReviewVerdict: true,
      talentReviewNotes: true,
      talentReviewedAt: true,
      talentReviewedBy: { select: { name: true, email: true } },
      hireReviewVerdict: true,
      hireReviewNotes: true,
      hireReviewedAt: true,
      hireReviewedBy: { select: { name: true, email: true } },
    },
  });
  if (!app) throw notFound("Application");
  return app;
}
