import type { Prisma } from "@prisma/client";
import { BillingEventType, BillingPlan } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, forbidden } from "@/lib/api/errors";
import { customerOrganizationWhere, isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

export function billingWebhookSecret(): string | null {
  return process.env.BILLING_WEBHOOK_SECRET?.trim() || null;
}

export function isBillingWebhookAuthorized(headerSecret: string | null): boolean {
  const expected = billingWebhookSecret();
  if (!expected) return process.env.NODE_ENV !== "production";
  return Boolean(headerSecret && headerSecret === expected);
}

export async function ensureOrganizationBilling(organizationId: string) {
  return db.organizationBilling.upsert({
    where: { organizationId },
    create: { organizationId, plan: BillingPlan.FREE, seatLimit: 5 },
    update: {},
  });
}

export async function recordBillingEvent(input: {
  organizationId?: string | null;
  type: BillingEventType;
  payload: Prisma.InputJsonValue;
}) {
  return db.billingEvent.create({
    data: {
      organizationId: input.organizationId ?? null,
      type: input.type,
      payload: input.payload,
    },
  });
}

export async function syncSeatUsageSnapshot(organizationId: string) {
  await ensureOrganizationBilling(organizationId);
  const seatUsage = await db.organizationMember.count({ where: { organizationId } });
  const billing = await db.organizationBilling.findUnique({ where: { organizationId } });

  await recordBillingEvent({
    organizationId,
    type: BillingEventType.SEAT_USAGE_SNAPSHOT,
    payload: {
      seatUsage,
      seatLimit: billing?.seatLimit ?? 5,
      plan: billing?.plan ?? "FREE",
      capturedAt: new Date().toISOString(),
    },
  });

  return { seatUsage, seatLimit: billing?.seatLimit ?? 5, plan: billing?.plan ?? "FREE" };
}

export async function assignBillingPlan(
  ctx: AuthContext,
  organizationId: string,
  plan: BillingPlan,
  seatLimit?: number
) {
  if (!isPlatformSuperAdmin(ctx)) throw forbidden("Platform super admin access required");

  const org = await db.organization.findFirst({
    where: { id: organizationId, ...customerOrganizationWhere() },
  });
  if (!org) throw badRequest("Organization not found");

  const billing = await db.organizationBilling.upsert({
    where: { organizationId },
    create: {
      organizationId,
      plan,
      seatLimit: seatLimit ?? 5,
    },
    update: {
      plan,
      ...(seatLimit != null ? { seatLimit } : {}),
    },
  });

  await recordBillingEvent({
    organizationId,
    type: BillingEventType.PLAN_ASSIGNED,
    payload: { plan, seatLimit: billing.seatLimit, assignedBy: ctx.userId },
  });

  return billing;
}

export type BillingWebhookPayload = {
  organizationId?: string;
  organizationSlug?: string;
  event?: string;
  plan?: BillingPlan;
  seatLimit?: number;
  externalCustomerId?: string;
  [key: string]: unknown;
};

export async function handleBillingWebhook(payload: BillingWebhookPayload) {
  let organizationId = payload.organizationId;

  if (!organizationId && payload.organizationSlug) {
    const org = await db.organization.findFirst({
      where: { slug: payload.organizationSlug, ...customerOrganizationWhere() },
      select: { id: true },
    });
    organizationId = org?.id;
  }

  await recordBillingEvent({
    organizationId: organizationId ?? null,
    type: BillingEventType.WEBHOOK_RECEIVED,
    payload: payload as Prisma.InputJsonValue,
  });

  if (organizationId && payload.plan) {
    await db.organizationBilling.upsert({
      where: { organizationId },
      create: {
        organizationId,
        plan: payload.plan,
        seatLimit: payload.seatLimit ?? 5,
        externalCustomerId: payload.externalCustomerId ?? null,
      },
      update: {
        plan: payload.plan,
        ...(payload.seatLimit != null ? { seatLimit: payload.seatLimit } : {}),
        ...(payload.externalCustomerId
          ? { externalCustomerId: payload.externalCustomerId }
          : {}),
      },
    });

    if (payload.event === "invoice.paid") {
      await recordBillingEvent({
        organizationId,
        type: BillingEventType.INVOICE_PAID,
        payload: payload as Prisma.InputJsonValue,
      });
    }
  }

  if (organizationId) {
    await syncSeatUsageSnapshot(organizationId);
  }

  return { ok: true, organizationId: organizationId ?? null };
}

export async function listRecentBillingEvents(ctx: AuthContext, limit = 20) {
  if (!isPlatformSuperAdmin(ctx)) throw forbidden("Platform super admin access required");
  return db.billingEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });
}
