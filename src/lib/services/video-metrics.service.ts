import type { Prisma } from "@prisma/client";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import { assertTenantWorkspaceWrite } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import { db } from "@/lib/db";
import { aggregateVideoBehavioralMetrics } from "@/lib/intelligence/video/video-behavioral-engine";
import type { SubmitVideoMetricsInput } from "@/lib/validators/video-metrics";

export async function saveInterviewVideoMetrics(
  ctx: AuthContext,
  applicationId: string,
  interviewId: string,
  input: SubmitVideoMetricsInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  await assertApplicationAccess(ctx, applicationId);

  const interview = await db.interview.findFirst({
    where: { id: interviewId, applicationId },
  });
  if (!interview) throw notFound("Interview");

  if (!input.consentAccepted || !input.candidateInformed) {
    throw badRequest(
      "Explicit consent and candidate notification are required",
      "CONSENT_REQUIRED"
    );
  }

  const consentAt = new Date();
  const metrics = aggregateVideoBehavioralMetrics({
    source: input.source,
    durationSec: input.durationSec,
    samples: input.samples,
    consentAt,
    candidateInformed: input.candidateInformed,
  });

  return db.interview.update({
    where: { id: interviewId },
    data: {
      videoMetricsConsentAt: consentAt,
      videoBehavioralMetrics: metrics as unknown as Prisma.InputJsonValue,
    },
  });
}
