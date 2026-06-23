import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import {
  defaultOutreachTemplate,
  extractTemplateVariables,
  renderOutreachTemplate,
} from "@/lib/intelligence/outreach/template-engine";
import { personalizeOutreachMessage } from "@/lib/intelligence/outreach/personalize-engine";
import {
  canTransitionStatus,
  computeCampaignStats,
  nextStatusForEvent,
  type OutreachMessageStatus,
} from "@/lib/intelligence/outreach/tracking-engine";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import {
  outreachCampaignDetailInclude,
  outreachCampaignListInclude,
} from "@/lib/db/includes";
import { getJobById } from "@/lib/services/job.service";
import type { z } from "zod";
import type {
  addOutreachRecipientsSchema,
  createOutreachCampaignSchema,
  createOutreachTemplateSchema,
  generateOutreachMessagesSchema,
  outreachWebhookSchema,
  sendOutreachCampaignSchema,
  updateOutreachCampaignSchema,
  updateOutreachMessageSchema,
  updateOutreachTemplateSchema,
} from "@/lib/validators/outreach";

type CreateTemplateInput = z.infer<typeof createOutreachTemplateSchema>;
type UpdateTemplateInput = z.infer<typeof updateOutreachTemplateSchema>;
type CreateCampaignInput = z.infer<typeof createOutreachCampaignSchema>;
type UpdateCampaignInput = z.infer<typeof updateOutreachCampaignSchema>;
type AddRecipientsInput = z.infer<typeof addOutreachRecipientsSchema>;
type GenerateInput = z.infer<typeof generateOutreachMessagesSchema>;
type SendInput = z.infer<typeof sendOutreachCampaignSchema>;
type UpdateMessageInput = z.infer<typeof updateOutreachMessageSchema>;
type WebhookInput = z.infer<typeof outreachWebhookSchema>;

async function getOrgName(ctx: AuthContext): Promise<string> {
  const org = await db.organization.findFirst({
    where: { id: ctx.actingOrganizationId ?? ctx.organizationId },
    select: { name: true },
  });
  return org?.name ?? "our company";
}

// ─── Templates (P2-012) ─────────────────────────────────────────────────────

export async function listOutreachTemplates(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "outreach", action: "read" });
  return db.outreachTemplate.findMany({
    where: organizationFilter(ctx),
    orderBy: { name: "asc" },
  });
}

export async function createOutreachTemplate(ctx: AuthContext, input: CreateTemplateInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const variables = extractTemplateVariables(`${input.subject}\n${input.bodyMarkdown}`);

  return db.outreachTemplate.create({
    data: {
      organizationId,
      name: input.name.trim(),
      subject: input.subject.trim(),
      bodyMarkdown: input.bodyMarkdown.trim(),
      variables,
    },
  });
}

export async function ensureDefaultTemplate(ctx: AuthContext) {
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const existing = await db.outreachTemplate.findFirst({
    where: { organizationId },
  });
  if (existing) return existing;

  const defaults = defaultOutreachTemplate();
  return createOutreachTemplate(ctx, defaults);
}

export async function updateOutreachTemplate(
  ctx: AuthContext,
  templateId: string,
  input: UpdateTemplateInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "update" });
  const template = await db.outreachTemplate.findFirst({
    where: { id: templateId, ...organizationFilter(ctx) },
  });
  if (!template) throw notFound("Outreach template");

  const subject = input.subject ?? template.subject;
  const bodyMarkdown = input.bodyMarkdown ?? template.bodyMarkdown;
  const variables = extractTemplateVariables(`${subject}\n${bodyMarkdown}`);

  return db.outreachTemplate.update({
    where: { id: templateId },
    data: {
      name: input.name?.trim(),
      subject: input.subject?.trim(),
      bodyMarkdown: input.bodyMarkdown?.trim(),
      variables,
    },
  });
}

// ─── Campaigns (P2-012) ─────────────────────────────────────────────────────

export async function listOutreachCampaigns(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "outreach", action: "read" });
  const campaigns = await db.outreachCampaign.findMany({
    where: organizationFilter(ctx),
    include: outreachCampaignListInclude,
    orderBy: { updatedAt: "desc" },
  });

  return Promise.all(
    campaigns.map(async (c) => {
      const messages = await db.outreachMessage.findMany({
        where: { campaignId: c.id },
        select: { status: true },
      });
      return { ...c, stats: computeCampaignStats(messages) };
    })
  );
}

export async function getOutreachCampaign(ctx: AuthContext, campaignId: string) {
  await assertPermission(ctx, { resource: "outreach", action: "read" });
  const campaign = await db.outreachCampaign.findFirst({
    where: { id: campaignId, ...organizationFilter(ctx) },
    include: outreachCampaignDetailInclude,
  });
  if (!campaign) throw notFound("Outreach campaign");
  const stats = computeCampaignStats(campaign.messages);
  return { ...campaign, stats };
}

export async function createOutreachCampaign(ctx: AuthContext, input: CreateCampaignInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  if (input.jobId) await getJobById(ctx, input.jobId);
  if (input.poolId) {
    const pool = await db.talentPool.findFirst({
      where: { id: input.poolId, ...organizationFilter(ctx) },
    });
    if (!pool) throw notFound("Talent pool");
  }
  if (input.templateId) {
    const template = await db.outreachTemplate.findFirst({
      where: { id: input.templateId, ...organizationFilter(ctx) },
    });
    if (!template) throw notFound("Outreach template");
  }

  return db.outreachCampaign.create({
    data: {
      organizationId,
      name: input.name.trim(),
      jobId: input.jobId ?? null,
      poolId: input.poolId ?? null,
      templateId: input.templateId ?? null,
      subjectOverride: input.subjectOverride?.trim() || null,
      createdById: ctx.userId,
    },
    include: outreachCampaignListInclude,
  });
}

export async function updateOutreachCampaign(
  ctx: AuthContext,
  campaignId: string,
  input: UpdateCampaignInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "update" });
  const campaign = await db.outreachCampaign.findFirst({
    where: { id: campaignId, ...organizationFilter(ctx) },
  });
  if (!campaign) throw notFound("Outreach campaign");

  return db.outreachCampaign.update({
    where: { id: campaignId },
    data: {
      name: input.name?.trim(),
      status: input.status,
      templateId: input.templateId,
      subjectOverride: input.subjectOverride,
    },
    include: outreachCampaignListInclude,
  });
}

export async function addOutreachRecipients(
  ctx: AuthContext,
  campaignId: string,
  input: AddRecipientsInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "update" });
  const campaign = await db.outreachCampaign.findFirst({
    where: { id: campaignId, ...organizationFilter(ctx) },
    include: { template: true, job: true },
  });
  if (!campaign) throw notFound("Outreach campaign");

  const template =
    campaign.template ??
    (await db.outreachTemplate.findFirst({
      where: { organizationId: campaign.organizationId },
    })) ??
    (await ensureDefaultTemplate(ctx));

  const candidateIds = new Set<string>(input.candidateIds ?? []);

  if (input.poolId) {
    const members = await db.talentPoolMember.findMany({
      where: {
        poolId: input.poolId,
        pool: { organizationId: campaign.organizationId },
      },
      select: { candidateId: true },
    });
    members.forEach((m) => candidateIds.add(m.candidateId));
  }

  if (candidateIds.size === 0) {
    throw badRequest("No recipients found", "NO_RECIPIENTS");
  }

  const candidates = await db.candidate.findMany({
    where: {
      id: { in: [...candidateIds] },
      organizationId: campaign.organizationId,
    },
  });

  const companyName = await getOrgName(ctx);
  const recruiterName = ctx.userName ?? "Recruiting team";
  const created = [];

  for (const candidate of candidates) {
    const rendered = renderOutreachTemplate(
      campaign.subjectOverride ?? template.subject,
      template.bodyMarkdown,
      {
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        jobTitle: campaign.job?.title,
        recruiterName,
        companyName,
      }
    );

    const message = await db.outreachMessage.upsert({
      where: {
        campaignId_candidateId: { campaignId, candidateId: candidate.id },
      },
      create: {
        organizationId: campaign.organizationId,
        campaignId,
        candidateId: candidate.id,
        status: "DRAFT",
        subject: rendered.subject,
        bodyText: rendered.bodyText,
      },
      update: {
        subject: rendered.subject,
        bodyText: rendered.bodyText,
      },
    });
    created.push(message);
  }

  return { added: created.length, messageIds: created.map((m) => m.id) };
}

// ─── Personalization (P2-013) ─────────────────────────────────────────────────

export async function generateOutreachMessages(
  ctx: AuthContext,
  campaignId: string,
  input: GenerateInput
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  await assertPermission(ctx, { resource: "outreach", action: "update" });

  const campaign = await db.outreachCampaign.findFirst({
    where: { id: campaignId, ...organizationFilter(ctx) },
    include: {
      template: true,
      job: true,
      messages: {
        include: { candidate: true },
        where: input.messageIds?.length ? { id: { in: input.messageIds } } : undefined,
      },
    },
  });
  if (!campaign) throw notFound("Outreach campaign");

  const template =
    campaign.template ?? (await ensureDefaultTemplate(ctx));
  const companyName = await getOrgName(ctx);
  const recruiterName = ctx.userName ?? "Recruiting team";

  const results = [];
  for (const message of campaign.messages) {
    const profile = buildCandidateIntelligenceText(message.candidate);
    const personalized = await personalizeOutreachMessage({
      candidateName: message.candidate.name,
      candidateEmail: message.candidate.email,
      candidateProfile: profile,
      jobTitle: campaign.job?.title,
      jobDescription: campaign.job?.description,
      jobRequirements: campaign.job?.requirements,
      recruiterName,
      companyName,
      templateSubject: campaign.subjectOverride ?? template.subject,
      templateBody: template.bodyMarkdown,
      tone: input.tone,
    });

    const updated = await db.outreachMessage.update({
      where: { id: message.id },
      data: {
        status: "GENERATED",
        subject: personalized.subject,
        bodyText: personalized.bodyText,
        personalizedAt: new Date(),
        personalization: personalized as Prisma.InputJsonValue,
      },
    });
    results.push({ messageId: updated.id, personalized });
  }

  return {
    generated: results.length,
    results,
    explanation: `Personalized ${results.length} message${results.length === 1 ? "" : "s"}.`,
  };
}

// ─── Tracking & send (P2-014) ─────────────────────────────────────────────────

export async function sendOutreachCampaign(
  ctx: AuthContext,
  campaignId: string,
  input: SendInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "send" });

  const campaign = await db.outreachCampaign.findFirst({
    where: { id: campaignId, ...organizationFilter(ctx) },
  });
  if (!campaign) throw notFound("Outreach campaign");

  const messages = await db.outreachMessage.findMany({
    where: {
      campaignId,
      ...(input.messageIds?.length ? { id: { in: input.messageIds } } : {}),
      status: { in: ["GENERATED", "DRAFT", "SCHEDULED"] },
    },
    include: { candidate: { select: { email: true } } },
  });

  if (messages.length === 0) {
    throw badRequest("No send-ready messages found", "NO_MESSAGES");
  }

  let sent = 0;
  for (const message of messages) {
    if (!message.candidate.email) {
      await db.outreachMessage.update({
        where: { id: message.id },
        data: {
          status: "FAILED",
          errorMessage: "Candidate has no email address",
        },
      });
      continue;
    }

    const externalId = `local-${message.id}-${Date.now()}`;
    await db.outreachMessage.update({
      where: { id: message.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        externalId,
      },
    });
    await db.outreachEvent.create({
      data: {
        messageId: message.id,
        type: "SENT",
        payload: { externalId, mode: "log_only" },
      },
    });
    sent += 1;
  }

  if (campaign.status === "DRAFT" && sent > 0) {
    await db.outreachCampaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });
  }

  return {
    sent,
    skipped: messages.length - sent,
    explanation: `Marked ${sent} message${sent === 1 ? "" : "s"} as sent (log-only until ESP integration).`,
  };
}

export async function updateOutreachMessage(
  ctx: AuthContext,
  messageId: string,
  input: UpdateMessageInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "outreach", action: "update" });

  const message = await db.outreachMessage.findFirst({
    where: { id: messageId, ...organizationFilter(ctx) },
  });
  if (!message) throw notFound("Outreach message");

  if (input.status && !canTransitionStatus(message.status as OutreachMessageStatus, input.status as OutreachMessageStatus)) {
    throw badRequest(`Invalid status transition from ${message.status} to ${input.status}`);
  }

  const data: Prisma.OutreachMessageUpdateInput = {
    subject: input.subject?.trim(),
    bodyText: input.bodyText?.trim(),
    status: input.status,
    replySnippet: input.replySnippet?.trim(),
  };

  if (input.status === "REPLIED" && input.replySnippet) {
    data.repliedAt = new Date();
  }
  if (input.status === "OPENED") {
    data.openedAt = new Date();
    data.openCount = { increment: 1 };
  }

  return db.outreachMessage.update({ where: { id: messageId }, data });
}

export async function recordOutreachWebhook(ctx: AuthContext, input: WebhookInput) {
  await assertPermission(ctx, { resource: "outreach", action: "send" });

  const message = await db.outreachMessage.findFirst({
    where: { id: input.messageId, ...organizationFilter(ctx) },
  });
  if (!message) throw notFound("Outreach message");

  const nextStatus = nextStatusForEvent(
    message.status as OutreachMessageStatus,
    input.type
  );

  const eventType = input.type.toUpperCase() as
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "REPLIED"
    | "BOUNCED"
    | "FAILED";

  await db.outreachEvent.create({
    data: {
      messageId: message.id,
      type: eventType,
      payload: input as Prisma.InputJsonValue,
    },
  });

  const update: Prisma.OutreachMessageUpdateInput = {
    status: nextStatus,
    externalId: input.externalId ?? message.externalId,
    errorMessage: input.errorMessage ?? null,
  };

  if (input.type === "opened") {
    update.openedAt = new Date();
    update.openCount = { increment: 1 };
  }
  if (input.type === "replied") {
    update.repliedAt = new Date();
    update.replySnippet = input.snippet ?? null;
  }
  if (input.type === "sent") {
    update.sentAt = new Date();
  }

  return db.outreachMessage.update({ where: { id: message.id }, data: update });
}
