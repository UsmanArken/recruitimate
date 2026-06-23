import { db } from "@/lib/db";
import { deliverEmail } from "@/lib/email/transport";
import { notificationsEnabled } from "@/lib/email/config";
import type { EmailNotificationType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export async function sendHiringNotification(input: {
  organizationId: string;
  type: EmailNotificationType;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  payload?: Prisma.InputJsonValue;
}): Promise<{ status: "SENT" | "SKIPPED" | "FAILED"; id?: string }> {
  if (!notificationsEnabled()) {
    return { status: "SKIPPED" };
  }

  if (!input.recipientEmail?.trim()) {
    return { status: "SKIPPED" };
  }

  const row = await db.emailNotification.create({
    data: {
      organizationId: input.organizationId,
      type: input.type,
      status: "QUEUED",
      recipientEmail: input.recipientEmail.toLowerCase(),
      subject: input.subject,
      bodyText: input.bodyText,
      payload: input.payload,
    },
  });

  try {
    await deliverEmail({
      to: input.recipientEmail,
      subject: input.subject,
      text: input.bodyText,
    });

    await db.emailNotification.update({
      where: { id: row.id },
      data: { status: "SENT", sentAt: new Date(), error: null },
    });

    return { status: "SENT", id: row.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.emailNotification.update({
      where: { id: row.id },
      data: { status: "FAILED", error: message },
    });
    return { status: "FAILED", id: row.id };
  }
}

export async function resolveJobNotificationEmails(jobId: string): Promise<string[]> {
  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      hiringManager: { select: { email: true } },
      assignments: { include: { user: { select: { email: true } } } },
    },
  });

  if (!job) return [];

  const emails = new Set<string>();
  if (job.hiringManager?.email) emails.add(job.hiringManager.email.toLowerCase());
  for (const assignment of job.assignments) {
    if (assignment.user.email) emails.add(assignment.user.email.toLowerCase());
  }

  return [...emails];
}
