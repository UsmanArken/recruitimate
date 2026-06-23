import { z } from "zod";

export const createOutreachTemplateSchema = z.object({
  name: z.string().min(2).max(80),
  subject: z.string().min(3).max(200),
  bodyMarkdown: z.string().min(20).max(20000),
});

export const updateOutreachTemplateSchema = createOutreachTemplateSchema.partial();

export const createOutreachCampaignSchema = z.object({
  name: z.string().min(2).max(120),
  jobId: z.string().cuid().optional(),
  poolId: z.string().cuid().optional(),
  templateId: z.string().cuid().optional(),
  subjectOverride: z.string().max(200).optional(),
});

export const updateOutreachCampaignSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  templateId: z.string().cuid().nullable().optional(),
  subjectOverride: z.string().max(200).nullable().optional(),
});

export const addOutreachRecipientsSchema = z.object({
  candidateIds: z.array(z.string().cuid()).min(1).max(100).optional(),
  poolId: z.string().cuid().optional(),
}).refine((v) => Boolean(v.candidateIds?.length || v.poolId), {
  message: "Provide candidateIds or poolId",
});

export const generateOutreachMessagesSchema = z.object({
  messageIds: z.array(z.string().cuid()).optional(),
  tone: z.enum(["professional", "warm", "direct"]).optional().default("professional"),
});

export const sendOutreachCampaignSchema = z.object({
  messageIds: z.array(z.string().cuid()).optional(),
});

export const updateOutreachMessageSchema = z.object({
  status: z
    .enum(["DRAFT", "GENERATED", "SCHEDULED", "SENT", "DELIVERED", "OPENED", "REPLIED", "BOUNCED", "FAILED"])
    .optional(),
  subject: z.string().min(3).max(200).optional(),
  bodyText: z.string().min(10).max(20000).optional(),
  replySnippet: z.string().max(5000).optional(),
});

export const outreachWebhookSchema = z.object({
  messageId: z.string().cuid(),
  type: z.enum(["sent", "delivered", "opened", "replied", "bounced", "failed"]),
  externalId: z.string().max(200).optional(),
  snippet: z.string().max(5000).optional(),
  errorMessage: z.string().max(1000).optional(),
});
