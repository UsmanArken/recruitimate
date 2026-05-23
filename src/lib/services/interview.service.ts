import { db } from "@/lib/db";
import { applicationDetailInclude } from "@/lib/db/includes";
import { badRequest, notFound } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { refreshApplicationIntelligence } from "@/lib/services/candidate-intelligence.service";
import type { CreateInterviewInput } from "@/lib/validators/interview";

export async function createInterviewAndAnalyze(
  ctx: AuthContext,
  applicationId: string,
  input: CreateInterviewInput
) {
  await assertPermission(ctx, { resource: "interviews", action: "create" });
  const { jobId } = await assertApplicationAccess(ctx, applicationId);

  await assertPermission(ctx, {
    resource: "interviews",
    action: "create",
    jobId,
  });

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: { candidate: true, job: true },
  });

  if (!application) throw notFound("Application");
  if (!application.candidate.resumeText) {
    throw badRequest("No resume text on file", "NO_RESUME");
  }

  const analysis = await analyzeInterview(
    input.transcript,
    application.candidate.resumeText
  );

  const interview = await db.interview.create({
    data: {
      applicationId,
      title: input.title,
      status: "ANALYZED",
      transcript: input.transcript,
      analysis: {
        create: {
          hesitationScore: analysis.hesitationScore,
          confidenceScore: analysis.confidenceScore,
          clarityScore: analysis.clarityScore,
          consistencyScore: analysis.consistencyScore,
          engagementScore: analysis.engagementScore,
          cognitiveSignals: analysis.cognitiveSignals,
          behavioralMetrics: analysis.behavioralMetrics,
          riskFlags: analysis.riskFlags,
          explanation: analysis.explanation,
          rawAnalysis: analysis,
        },
      },
    },
    include: { analysis: true },
  });

  await db.jobApplication.update({
    where: { id: applicationId },
    data: { stage: "INTERVIEWED" },
  });

  const full = await db.jobApplication.findFirst({
    where: { id: applicationId },
    include: applicationDetailInclude,
  });

  const { decision } = await refreshApplicationIntelligence({
    applicationId,
    candidateName: application.candidate.name,
    resumeText: application.candidate.resumeText ?? "",
    job: {
      id: application.jobId,
      title: full?.job.title ?? application.job.title,
      requirements: full?.job.requirements ?? application.job.requirements,
    },
    interviews: full?.interviews ?? [interview],
  });

  return { interview, decision };
}
