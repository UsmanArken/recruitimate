import { db } from "@/lib/db";
import { jobListInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { canAccessJob, jobsWhereClause } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateJobInput, UpdateJobInput } from "@/lib/validators/job";

export async function listJobs(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "jobs", action: "read" });
  const where = await jobsWhereClause(ctx);
  return db.job.findMany({
    where,
    include: jobListInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function createJob(ctx: AuthContext, input: CreateJobInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "jobs", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  if (input.hiringClientId) {
    await db.hiringClient.findFirstOrThrow({
      where: { id: input.hiringClientId, organizationId },
    });
  }

  return db.job.create({
    data: {
      title: input.title,
      description: input.description,
      requirements: input.requirements || null,
      jobPostDocument: input.jobPostDocument,
      hiringClientId: input.hiringClientId || null,
      organizationId,
      hiringManagerId: ctx.roleCode === "HIRING_MANAGER" ? ctx.userId : undefined,
    },
    include: jobListInclude,
  });
}

export async function updateJob(ctx: AuthContext, id: string, input: UpdateJobInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "jobs", action: "update" });
  await getJobById(ctx, id);
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  if (input.hiringClientId) {
    await db.hiringClient.findFirstOrThrow({
      where: { id: input.hiringClientId, organizationId },
    });
  }

  return db.job.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      requirements: input.requirements === undefined ? undefined : input.requirements || null,
      jobPostDocument: input.jobPostDocument,
      hiringClientId:
        input.hiringClientId === undefined
          ? undefined
          : input.hiringClientId || null,
    },
    include: jobListInclude,
  });
}

export async function deleteJob(ctx: AuthContext, id: string) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "jobs", action: "delete" });
  await getJobById(ctx, id);
  await db.job.delete({ where: { id } });
}

export async function findJobById(ctx: AuthContext, id: string) {
  const job = await db.job.findFirst({
    where: { id, ...organizationFilter(ctx) },
  });
  if (!job) return null;
  if (!(await canAccessJob(ctx, id))) return null;
  return job;
}

export async function getJobById(ctx: AuthContext, id: string) {
  const job = await findJobById(ctx, id);
  if (!job) throw notFound("Job");
  return job;
}
