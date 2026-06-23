import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertApplicationAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { generateLiveAssistSuggestions } from "@/lib/intelligence/interview/live-assist-engine";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import type { LiveAssistInput } from "@/lib/validators/live-assist";

export async function generateApplicationLiveAssist(
  ctx: AuthContext,
  applicationId: string,
  input: LiveAssistInput
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  await assertPermission(ctx, { resource: "interviews", action: "read" });
  await assertApplicationAccess(ctx, applicationId);

  const application = await db.jobApplication.findFirst({
    where: { id: applicationId, ...organizationFilter(ctx) },
    include: {
      candidate: true,
      job: true,
      talentProfile: true,
    },
  });

  if (!application) throw notFound("Application");

  const talentGaps = (application.talentProfile?.gaps as string[] | undefined) ?? [];
  const talentStrengths = (application.talentProfile?.strengths as string[] | undefined) ?? [];
  const skills = (application.talentProfile?.skills as string[] | undefined) ?? [];
  const resumeText = buildCandidateIntelligenceText(application.candidate);

  const result = await generateLiveAssistSuggestions({
    transcript: input.transcript,
    candidateName: application.candidate.name,
    jobTitle: application.job.title,
    jobRequirements: application.job.requirements,
    resumeText,
    skills,
    experienceYears: application.talentProfile?.experienceYears ?? null,
    talentGaps,
    talentStrengths,
  });

  return {
    ...result,
    applicationId,
    interviewId: input.interviewId ?? null,
    transcriptLength: input.transcript.length,
  };
}
