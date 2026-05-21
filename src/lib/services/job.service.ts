import { db } from "@/lib/db";
import { jobListInclude } from "@/lib/db/includes";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { canAccessJob, jobsWhereClause } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateJobInput } from "@/lib/validators/job";

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
  await assertPermission(ctx, { resource: "jobs", action: "create" });
  return db.job.create({
    data: {
      ...input,
      organizationId: ctx.organizationId,
      hiringManagerId:
        ctx.roleCode === "HIRING_MANAGER" ? ctx.userId : undefined,
    },
    include: jobListInclude,
  });
}

export async function findJobById(ctx: AuthContext, id: string) {
  const job = await db.job.findFirst({
    where: { id, organizationId: ctx.organizationId },
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
