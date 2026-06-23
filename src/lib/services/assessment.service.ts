import type { Prisma } from "@prisma/client";
import type { AssessmentTaskType } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { generateAssessmentTasks } from "@/lib/intelligence/assessment/assessment-engine";
import { evaluateAssessmentSubmission } from "@/lib/intelligence/assessment/evaluation-engine";
import type { AssessmentRubricCriterion, AssessmentTaskKind } from "@/lib/intelligence/types";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { refreshApplicationIntelligence } from "@/lib/services/candidate-intelligence.service";
import { getJobById } from "@/lib/services/job.service";
import { applicationDetailInclude } from "@/lib/db/includes";
import type { generateAssessmentTasksSchema } from "@/lib/validators/assessment";
import type { z } from "zod";

type GenerateInput = z.infer<typeof generateAssessmentTasksSchema>;

function toPrismaTaskType(kind: AssessmentTaskKind): AssessmentTaskType {
  const map: Record<AssessmentTaskKind, AssessmentTaskType> = {
    code: "CODE",
    product: "PRODUCT",
    ops: "OPS",
    scenario: "SCENARIO",
  };
  return map[kind];
}

function fromPrismaTaskType(type: AssessmentTaskType): AssessmentTaskKind {
  const map: Record<AssessmentTaskType, AssessmentTaskKind> = {
    CODE: "code",
    PRODUCT: "product",
    OPS: "ops",
    SCENARIO: "scenario",
  };
  return map[type];
}

export async function generateJobAssessmentTasks(
  ctx: AuthContext,
  jobId: string,
  input: GenerateInput
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const job = await getJobById(ctx, jobId);
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const generated = await generateAssessmentTasks({
    jobTitle: job.title,
    jobDescription: job.description,
    jobRequirements: job.requirements,
    focus: input.focus === "all" ? "all" : input.focus,
    count: input.count,
  });

  const created = [];
  for (const task of generated.tasks) {
    const row = await db.assessmentTask.create({
      data: {
        organizationId,
        jobId,
        title: task.title,
        prompt: task.prompt,
        taskType: toPrismaTaskType(task.taskType),
        difficulty: task.difficulty,
        rubric: task.rubric as Prisma.InputJsonValue,
        skillsTested: task.skillsTested as Prisma.InputJsonValue,
        deliverables: task.deliverables as Prisma.InputJsonValue,
        estimatedMinutes: task.estimatedMinutes,
        rawGeneration: task as Prisma.InputJsonValue,
      },
    });
    created.push({
      ...row,
      taskType: fromPrismaTaskType(row.taskType),
    });
  }

  return {
    tasks: created,
    roleSummary: generated.roleSummary,
    explanation: generated.explanation,
  };
}

export async function listJobAssessmentTasks(ctx: AuthContext, jobId: string) {
  await assertPermission(ctx, { resource: "jobs", action: "read" });
  await getJobById(ctx, jobId);

  const tasks = await db.assessmentTask.findMany({
    where: { jobId, ...organizationFilter(ctx) },
    orderBy: { createdAt: "desc" },
  });

  return tasks.map((t) => ({
    ...t,
    taskType: fromPrismaTaskType(t.taskType),
  }));
}

export async function listApplicationAssessments(ctx: AuthContext, applicationId: string) {
  await assertApplicationAccess(ctx, applicationId);
  await assertPermission(ctx, { resource: "candidates", action: "read" });

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: {
      job: true,
      candidate: { select: { id: true, name: true } },
      assessmentSubmissions: {
        include: { task: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!application) throw notFound("Application");

  const jobTasks = await db.assessmentTask.findMany({
    where: { jobId: application.jobId, ...organizationFilter(ctx) },
    orderBy: { createdAt: "desc" },
  });

  return {
    applicationId,
    candidate: application.candidate,
    jobId: application.jobId,
    tasks: jobTasks.map((t) => ({ ...t, taskType: fromPrismaTaskType(t.taskType) })),
    submissions: application.assessmentSubmissions.map((s) => ({
      ...s,
      task: { ...s.task, taskType: fromPrismaTaskType(s.task.taskType) },
    })),
  };
}

async function getSubmissionContext(
  ctx: AuthContext,
  applicationId: string,
  taskId: string
) {
  await assertApplicationAccess(ctx, applicationId);

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: { candidate: true, job: true },
  });
  if (!application) throw notFound("Application");

  const task = await db.assessmentTask.findFirst({
    where: { id: taskId, jobId: application.jobId, ...organizationFilter(ctx) },
  });
  if (!task) throw notFound("Assessment task");

  return { application, task };
}

export async function submitAssessmentResponse(
  ctx: AuthContext,
  applicationId: string,
  taskId: string,
  responseText: string,
  responseUrl?: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });

  const { application, task } = await getSubmissionContext(ctx, applicationId, taskId);

  return db.assessmentSubmission.upsert({
    where: {
      applicationId_taskId: { applicationId, taskId },
    },
    create: {
      organizationId: application.organizationId,
      applicationId,
      taskId,
      status: "SUBMITTED",
      responseText: responseText.trim(),
      responseUrl: responseUrl?.trim() || null,
      submittedAt: new Date(),
    },
    update: {
      status: "SUBMITTED",
      responseText: responseText.trim(),
      responseUrl: responseUrl?.trim() || null,
      submittedAt: new Date(),
    },
    include: { task: true },
  });
}

export async function evaluateAssessmentSubmissionForApplication(
  ctx: AuthContext,
  applicationId: string,
  taskId: string,
  responseTextOverride?: string
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  await assertPermission(ctx, { resource: "candidates", action: "update" });

  const { application, task } = await getSubmissionContext(ctx, applicationId, taskId);

  const submission = await db.assessmentSubmission.findUnique({
    where: { applicationId_taskId: { applicationId, taskId } },
  });

  const responseText = responseTextOverride?.trim() || submission?.responseText?.trim();
  if (!responseText || responseText.length < 50) {
    throw badRequest("Submit a response (at least 50 characters) before evaluation", "NO_RESPONSE");
  }

  const rubric = (Array.isArray(task.rubric) ? task.rubric : []) as AssessmentRubricCriterion[];
  const skillsTested = Array.isArray(task.skillsTested) ? (task.skillsTested as string[]) : [];

  const evaluation = await evaluateAssessmentSubmission({
    task: {
      title: task.title,
      prompt: task.prompt,
      taskType: fromPrismaTaskType(task.taskType),
      rubric,
      skillsTested,
    },
    responseText,
    candidateName: application.candidate.name,
  });

  const saved = await db.assessmentSubmission.upsert({
    where: { applicationId_taskId: { applicationId, taskId } },
    create: {
      organizationId: application.organizationId,
      applicationId,
      taskId,
      status: "EVALUATED",
      responseText,
      submittedAt: new Date(),
      overallScore: evaluation.overallScore,
      evaluation: evaluation as Prisma.InputJsonValue,
      evaluatedAt: new Date(),
    },
    update: {
      status: "EVALUATED",
      responseText,
      overallScore: evaluation.overallScore,
      evaluation: evaluation as Prisma.InputJsonValue,
      evaluatedAt: new Date(),
    },
    include: { task: true },
  });

  const fullApp = await db.jobApplication.findFirst({
    where: { id: applicationId },
    include: applicationDetailInclude,
  });

  if (fullApp) {
    const bestScore = await getBestAssessmentScore(applicationId);
    await refreshApplicationIntelligence({
      applicationId,
      candidateName: fullApp.candidate.name,
      resumeText: buildCandidateIntelligenceText(fullApp.candidate),
      job: {
        id: fullApp.jobId,
        title: fullApp.job.title,
        requirements: fullApp.job.requirements,
      },
      interviews: fullApp.interviews,
      assessmentScore: bestScore,
    });
  }

  return { submission: saved, evaluation };
}

export async function getBestAssessmentScore(applicationId: string): Promise<number | null> {
  const best = await db.assessmentSubmission.findFirst({
    where: {
      applicationId,
      status: "EVALUATED",
      overallScore: { not: null },
    },
    orderBy: { overallScore: "desc" },
    select: { overallScore: true },
  });
  return best?.overallScore ?? null;
}
