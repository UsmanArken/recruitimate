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

export async function applicationsWhereClause(
  ctx: AuthContext
): Promise<Prisma.JobApplicationWhereInput> {
  if (isPlatformSuperAdmin(ctx)) return {};
  const base: Prisma.JobApplicationWhereInput = {
    organizationId: ctx.organizationId,
  };
  if (await hasPermission(ctx, { resource: "candidates", action: "read_all" })) {
    return base;
  }
  const jobIds = await getAssignedJobIds(ctx);
  return { ...base, jobId: { in: jobIds.length ? jobIds : ["__none__"] } };
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
    applications: {
      some: { jobId: { in: jobIds.length ? jobIds : ["__none__"] } },
    },
  };
}

export async function assertApplicationAccess(
  ctx: AuthContext,
  applicationId: string
): Promise<{ jobId: string; candidateId: string }> {
  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    select: { id: true, jobId: true, candidateId: true },
  });
  if (!application) throw notFound("Application");

  if (await hasPermission(ctx, { resource: "candidates", action: "read_all" })) {
    return { jobId: application.jobId, candidateId: application.candidateId };
  }

  if (await canAccessJob(ctx, application.jobId)) {
    return { jobId: application.jobId, candidateId: application.candidateId };
  }

  throw forbidden("You do not have access to this application");
}

export async function assertCandidateAccess(
  ctx: AuthContext,
  candidateId: string
): Promise<void> {
  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    select: { id: true },
  });
  if (!candidate) throw notFound("Candidate");

  if (await hasPermission(ctx, { resource: "candidates", action: "read_all" })) {
    return;
  }

  const accessible = await db.jobApplication.findFirst({
    where: {
      candidateId,
      ...(await applicationsWhereClause(ctx)),
    },
    select: { id: true },
  });

  if (accessible) return;

  throw forbidden("You do not have access to this candidate");
}
