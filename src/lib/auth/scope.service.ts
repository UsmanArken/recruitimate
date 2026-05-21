import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { forbidden, notFound } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/permission.service";
import {
  isPlatformSuperAdmin,
  organizationFilter,
} from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

/** Job IDs the user may access when not org-wide. */
export async function getAssignedJobIds(ctx: AuthContext): Promise<string[]> {
  const [managed, assigned] = await Promise.all([
    db.job.findMany({
      where: { organizationId: ctx.organizationId, hiringManagerId: ctx.userId },
      select: { id: true },
    }),
    db.jobAssignment.findMany({
      where: { userId: ctx.userId, job: { organizationId: ctx.organizationId } },
      select: { jobId: true },
    }),
  ]);

  const ids = new Set<string>();
  managed.forEach((j) => ids.add(j.id));
  assigned.forEach((a) => ids.add(a.jobId));
  return [...ids];
}

export async function canAccessJob(ctx: AuthContext, jobId: string): Promise<boolean> {
  if (isPlatformSuperAdmin(ctx)) {
    const job = await db.job.findUnique({ where: { id: jobId } });
    return Boolean(job);
  }
  if (await hasPermission(ctx, { resource: "jobs", action: "read_all" })) {
    const job = await db.job.findFirst({
      where: { id: jobId, ...organizationFilter(ctx) },
    });
    return Boolean(job);
  }
  const assigned = await getAssignedJobIds(ctx);
  return assigned.includes(jobId);
}

export async function jobsWhereClause(
  ctx: AuthContext
): Promise<Prisma.JobWhereInput> {
  if (isPlatformSuperAdmin(ctx)) return {};
  const base: Prisma.JobWhereInput = { organizationId: ctx.organizationId };
  if (await hasPermission(ctx, { resource: "jobs", action: "read_all" })) {
    return base;
  }
  const jobIds = await getAssignedJobIds(ctx);
  return { ...base, id: { in: jobIds.length ? jobIds : ["__none__"] } };
}

export async function candidatesWhereClause(
  ctx: AuthContext
): Promise<Prisma.CandidateWhereInput> {
  if (isPlatformSuperAdmin(ctx)) return {};
  const base: Prisma.CandidateWhereInput = { organizationId: ctx.organizationId };
  if (await hasPermission(ctx, { resource: "candidates", action: "read_all" })) {
    return base;
  }
  const jobIds = await getAssignedJobIds(ctx);
  return {
    ...base,
    OR: [
      { jobId: { in: jobIds.length ? jobIds : ["__none__"] } },
      { jobId: null },
    ],
  };
}

export async function assertCandidateAccess(
  ctx: AuthContext,
  candidateId: string
): Promise<{ jobId: string | null }> {
  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    select: { id: true, jobId: true },
  });
  if (!candidate) throw notFound("Candidate");

  if (await hasPermission(ctx, { resource: "candidates", action: "read_all" })) {
    return { jobId: candidate.jobId };
  }

  if (candidate.jobId && (await canAccessJob(ctx, candidate.jobId))) {
    return { jobId: candidate.jobId };
  }

  if (!candidate.jobId && (await hasPermission(ctx, { resource: "candidates", action: "read" }))) {
    return { jobId: null };
  }

  throw forbidden("You do not have access to this candidate");
}
