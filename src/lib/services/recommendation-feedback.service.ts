import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { RecommendationFeedbackInput } from "@/lib/validators/learning";

export async function submitRecommendationFeedback(
  ctx: AuthContext,
  applicationId: string,
  input: RecommendationFeedbackInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "learning", action: "manage" });
  await assertApplicationAccess(ctx, applicationId);

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    select: { id: true, organizationId: true, decision: true },
  });
  if (!application) throw notFound("Application");

  return db.recommendationFeedback.upsert({
    where: {
      applicationId_authorId: { applicationId, authorId: ctx.userId },
    },
    create: {
      organizationId: application.organizationId,
      applicationId,
      authorId: ctx.userId,
      rating: input.rating,
      comment: input.comment ?? null,
      recommendation: application.decision?.recommendation ?? null,
      hireConfidence: application.decision?.hireConfidence ?? null,
    },
    update: {
      rating: input.rating,
      comment: input.comment ?? null,
      recommendation: application.decision?.recommendation ?? null,
      hireConfidence: application.decision?.hireConfidence ?? null,
    },
  });
}
