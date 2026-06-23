import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";
import type { BackgroundJobType } from "@prisma/client";
import type { JobEnqueueResult, JobPayload } from "@/lib/jobs/types";
import { dispatchJob } from "@/lib/jobs/processor";

export async function enqueueBackgroundJob<T extends BackgroundJobType>(
  ctx: AuthContext,
  type: T,
  payload: JobPayload<T>
): Promise<JobEnqueueResult> {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const job = await db.backgroundJob.create({
    data: {
      organizationId,
      type,
      status: "QUEUED",
      payload: payload as Prisma.InputJsonValue,
    },
  });

  void dispatchJob(job.id).catch((error) => {
    console.error(`[jobs] dispatch failed for ${job.id}`, error);
  });

  return { jobId: job.id, status: "queued", type };
}

export async function getBackgroundJob(ctx: AuthContext, jobId: string) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const job = await db.backgroundJob.findFirst({
    where: { id: jobId, ...organizationFilter(ctx) },
  });
  if (!job) throw notFound("Job");
  return job;
}

export async function listRecentBackgroundJobs(ctx: AuthContext, limit = 20) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  return db.backgroundJob.findMany({
    where: organizationFilter(ctx),
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
