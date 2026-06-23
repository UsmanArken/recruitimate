import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";
import {
  buildInterviewAnalyzedEmail,
  buildStageChangeEmail,
} from "@/lib/email/templates/hiring-notifications";
import {
  resolveJobNotificationEmails,
  sendHiringNotification,
} from "@/lib/email/notification-dispatch";

async function notifyJobTeam(input: {
  organizationId: string;
  jobId: string;
  type: "STAGE_CHANGE" | "INTERVIEW_ANALYZED";
  subject: string;
  bodyText: string;
  payload: Prisma.InputJsonValue;
  excludeEmail?: string | null;
}) {
  const recipients = await resolveJobNotificationEmails(input.jobId);
  const filtered = input.excludeEmail
    ? recipients.filter((e) => e !== input.excludeEmail!.toLowerCase())
    : recipients;

  if (filtered.length === 0) {
    const orgMembers = await db.organizationMember.findMany({
      where: { organizationId: input.organizationId },
      include: { user: { select: { email: true } } },
      take: 5,
    });
    for (const member of orgMembers) {
      if (member.user.email) filtered.push(member.user.email.toLowerCase());
    }
  }

  const unique = [...new Set(filtered)];

  await Promise.all(
    unique.map((recipientEmail) =>
      sendHiringNotification({
        organizationId: input.organizationId,
        type: input.type,
        recipientEmail,
        subject: input.subject,
        bodyText: input.bodyText,
        payload: input.payload,
      })
    )
  );
}

export async function notifyApplicationStageChange(input: {
  organizationId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  fromStage: string;
  toStage: string;
  actorEmail?: string | null;
  actorName?: string | null;
}) {
  if (input.fromStage === input.toStage) return;

  const { subject, text } = buildStageChangeEmail({
    candidateName: input.candidateName,
    jobTitle: input.jobTitle,
    fromStage: input.fromStage,
    toStage: input.toStage,
    applicationId: input.applicationId,
    candidateId: input.candidateId,
    actorName: input.actorName,
  });

  void notifyJobTeam({
    organizationId: input.organizationId,
    jobId: input.jobId,
    type: "STAGE_CHANGE",
    subject,
    bodyText: text,
    excludeEmail: input.actorEmail,
    payload: {
      applicationId: input.applicationId,
      fromStage: input.fromStage,
      toStage: input.toStage,
    },
  }).catch((error) => {
    console.error("[notifications] stage change failed", error);
  });
}

export async function notifyInterviewAnalyzed(input: {
  organizationId: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  interviewTitle: string;
  hireConfidence: number | null;
  recommendation: string | null;
}) {
  const { subject, text } = buildInterviewAnalyzedEmail({
    candidateName: input.candidateName,
    jobTitle: input.jobTitle,
    interviewTitle: input.interviewTitle,
    hireConfidence: input.hireConfidence,
    recommendation: input.recommendation,
    applicationId: input.applicationId,
    candidateId: input.candidateId,
  });

  void notifyJobTeam({
    organizationId: input.organizationId,
    jobId: input.jobId,
    type: "INTERVIEW_ANALYZED",
    subject,
    bodyText: text,
    payload: {
      applicationId: input.applicationId,
      interviewTitle: input.interviewTitle,
    },
  }).catch((error) => {
    console.error("[notifications] interview analyzed failed", error);
  });
}

export async function listEmailNotifications(ctx: AuthContext, limit = 30) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  return db.emailNotification.findMany({
    where: organizationFilter(ctx),
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
