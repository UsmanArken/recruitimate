import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { getJobById } from "@/lib/services/job.service";
import type { AuthContext } from "@/lib/auth/types";
import type { CreateJobAssignmentInput } from "@/lib/validators/job-assignment";

const jobDetailInclude = {
  hiringManager: { select: { id: true, name: true, email: true } },
  assignments: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  _count: { select: { applications: true } },
} as const;

export async function getJobWithTeam(ctx: AuthContext, jobId: string) {
  await assertPermission(ctx, { resource: "jobs", action: "read" });
  await getJobById(ctx, jobId);

  const job = await db.job.findFirst({
    where: { id: jobId },
    include: jobDetailInclude,
  });
  if (!job) throw notFound("Job");
  return job;
}

export async function listAssignableMembers(ctx: AuthContext, jobId: string) {
  await assertPermission(ctx, { resource: "jobs", action: "update" });
  const job = await getJobById(ctx, jobId);

  return db.organizationMember.findMany({
    where: { organizationId: job.organizationId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: { select: { code: true, name: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function assignToJob(
  ctx: AuthContext,
  jobId: string,
  input: CreateJobAssignmentInput
) {
  await assertPermission(ctx, { resource: "jobs", action: "update" });
  const job = await getJobById(ctx, jobId);

  const member = await db.organizationMember.findFirst({
    where: { userId: input.userId, organizationId: job.organizationId },
  });
  if (!member) throw badRequest("User is not in your organization", "NOT_MEMBER");

  const existing = await db.jobAssignment.findUnique({
    where: {
      jobId_userId_assignmentRole: {
        jobId,
        userId: input.userId,
        assignmentRole: input.assignmentRole,
      },
    },
  });
  if (existing) {
    throw badRequest("User already has this role on the job", "ALREADY_ASSIGNED");
  }

  const assignment = await db.jobAssignment.create({
    data: {
      jobId,
      userId: input.userId,
      assignmentRole: input.assignmentRole,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (input.assignmentRole === "HIRING_MANAGER") {
    await db.job.update({
      where: { id: jobId },
      data: { hiringManagerId: input.userId },
    });
  }

  return assignment;
}

export async function removeJobAssignment(
  ctx: AuthContext,
  jobId: string,
  assignmentId: string
) {
  await assertPermission(ctx, { resource: "jobs", action: "update" });
  await getJobById(ctx, jobId);

  const assignment = await db.jobAssignment.findFirst({
    where: { id: assignmentId, jobId },
  });
  if (!assignment) throw notFound("Assignment");

  await db.jobAssignment.delete({ where: { id: assignmentId } });

  if (assignment.assignmentRole === "HIRING_MANAGER") {
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (job?.hiringManagerId === assignment.userId) {
      await db.job.update({
        where: { id: jobId },
        data: { hiringManagerId: null },
      });
    }
  }

  return { success: true };
}
