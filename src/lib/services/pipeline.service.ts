import { db } from "@/lib/db";
import { applicationListInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import {
  assertApplicationAccess,
  applicationsWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { PipelineStage } from "@prisma/client";
import type { pipelineBoardQuerySchema } from "@/lib/validators/pipeline";
import type { z } from "zod";

export type PipelineBoardQuery = z.infer<typeof pipelineBoardQuerySchema>;

export async function listPipelineBoard(ctx: AuthContext, query: PipelineBoardQuery = {}) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await applicationsWhereClause(ctx);
  if (query.jobId) {
    where.jobId = query.jobId;
  }

  return db.jobApplication.findMany({
    where,
    include: applicationListInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function updateApplicationStage(
  ctx: AuthContext,
  applicationId: string,
  stage: PipelineStage
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertApplicationAccess(ctx, applicationId);

  const existing = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
  });
  if (!existing) throw notFound("Application");

  return db.jobApplication.update({
    where: { id: applicationId },
    data: { stage },
    include: applicationListInclude,
  });
}
