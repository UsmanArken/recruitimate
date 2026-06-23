import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { organizationFilter } from "@/lib/auth/platform-admin";
import {
  assertApplicationAccess,
  applicationsWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { applicationDetailInclude } from "@/lib/db/includes";
import { runCopilotChat } from "@/lib/intelligence/copilot/copilot-engine";
import type { CompareCandidateContext } from "@/lib/intelligence/copilot/compare-handler";
import type { InterviewSummaryContext } from "@/lib/intelligence/copilot/interview-summary-handler";
import type { PipelineCandidateRow } from "@/lib/intelligence/copilot/top-candidates-handler";
import { getJobById } from "@/lib/services/job.service";
import type { copilotChatSchema } from "@/lib/validators/copilot";
import type { z } from "zod";

export type CopilotChatInput = z.infer<typeof copilotChatSchema>;

function toPipelineRow(app: {
  id: string;
  candidateId: string;
  candidate: { name: string };
  talentProfile: { roleFitScore: number | null; strengths: unknown } | null;
  decision: { hireConfidence: number | null; recommendation: string | null } | null;
}): PipelineCandidateRow {
  return {
    applicationId: app.id,
    candidateId: app.candidateId,
    name: app.candidate.name,
    roleFitScore: app.talentProfile?.roleFitScore ?? null,
    hireConfidence: app.decision?.hireConfidence ?? null,
    recommendation: app.decision?.recommendation ?? null,
    strengths: Array.isArray(app.talentProfile?.strengths)
      ? (app.talentProfile!.strengths as string[])
      : [],
  };
}

function toCompareContext(app: {
  id: string;
  candidateId: string;
  candidate: { name: string };
  talentProfile: {
    roleFitScore: number | null;
    strengths: unknown;
    gaps: unknown;
  } | null;
  decision: { hireConfidence: number | null; recommendation: string | null } | null;
  interviews: { title: string; transcript: string | null; analysis: { explanation: string | null } | null }[];
}): CompareCandidateContext {
  const latest = app.interviews[0];
  return {
    name: app.candidate.name,
    applicationId: app.id,
    candidateId: app.candidateId,
    roleFitScore: app.talentProfile?.roleFitScore ?? null,
    hireConfidence: app.decision?.hireConfidence ?? null,
    recommendation: app.decision?.recommendation ?? null,
    strengths: Array.isArray(app.talentProfile?.strengths)
      ? (app.talentProfile!.strengths as string[])
      : [],
    gaps: Array.isArray(app.talentProfile?.gaps) ? (app.talentProfile!.gaps as string[]) : [],
    interviewSummary: latest?.analysis?.explanation ?? latest?.transcript?.slice(0, 300) ?? null,
  };
}

async function loadApplicationBundle(ctx: AuthContext, applicationId: string) {
  await assertApplicationAccess(ctx, applicationId);
  const app = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: applicationDetailInclude,
  });
  if (!app) throw notFound("Application");
  return app;
}

export async function chatWithCopilot(ctx: AuthContext, input: CopilotChatInput) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });

  let jobTitle: string | null = null;
  let pipeline: PipelineCandidateRow[] | undefined;
  let compare: [CompareCandidateContext, CompareCandidateContext] | null = null;
  let interview: InterviewSummaryContext | null = null;

  if (input.jobId) {
    const job = await getJobById(ctx, input.jobId);
    jobTitle = job.title;

    const where = await applicationsWhereClause(ctx);
    const apps = await db.jobApplication.findMany({
      where: { ...where, jobId: input.jobId },
      include: {
        candidate: { select: { id: true, name: true } },
        talentProfile: true,
        decision: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    pipeline = apps.map(toPipelineRow);
  }

  if (input.compareApplicationIds) {
    const [appA, appB] = await Promise.all([
      loadApplicationBundle(ctx, input.compareApplicationIds[0]),
      loadApplicationBundle(ctx, input.compareApplicationIds[1]),
    ]);
    jobTitle = jobTitle ?? appA.job.title;
    compare = [toCompareContext(appA), toCompareContext(appB)];
  }

  const applicationId = input.applicationId ?? input.compareApplicationIds?.[0];
  if (applicationId && (input.interviewId || input.message.toLowerCase().includes("interview"))) {
    const app = await loadApplicationBundle(ctx, applicationId);
    jobTitle = jobTitle ?? app.job.title;

    const interviewRow = input.interviewId
      ? app.interviews.find((i) => i.id === input.interviewId)
      : app.interviews[0];

    if (interviewRow) {
      const risks = (interviewRow.analysis?.riskFlags as { value?: string }[] | undefined) ?? [];
      interview = {
        candidateName: app.candidate.name,
        jobTitle: app.job.title,
        interviewTitle: interviewRow.title,
        transcript: interviewRow.transcript,
        analysisExplanation: interviewRow.analysis?.explanation,
        confidenceScore: interviewRow.analysis?.confidenceScore,
        clarityScore: interviewRow.analysis?.clarityScore,
        consistencyScore: interviewRow.analysis?.consistencyScore,
        riskFlags: risks.map((r) => r.value).filter(Boolean) as string[],
      };
    }
  }

  return runCopilotChat({
    message: input.message,
    jobTitle,
    pipeline,
    compare,
    interview,
  });
}

export async function listCopilotJobs(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "jobs", action: "read" });
  const where = await applicationsWhereClause(ctx);
  const jobs = await db.job.findMany({
    where: organizationFilter(ctx),
    select: {
      id: true,
      title: true,
      _count: { select: { applications: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const apps = await db.jobApplication.findMany({
    where,
    select: {
      id: true,
      jobId: true,
      candidate: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return {
    jobs,
    applications: apps.map((a) => ({
      applicationId: a.id,
      jobId: a.jobId,
      candidateId: a.candidate.id,
      candidateName: a.candidate.name,
    })),
  };
}
