import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { forbidden, notFound } from "@/lib/api/errors";
import {
  customerOrganizationWhere,
  isPlatformSuperAdmin,
} from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

export type TenantUsageRow = {
  organizationId: string;
  name: string;
  slug: string;
  members: number;
  jobs: number;
  candidates: number;
  applications: number;
  interviews: number;
  outcomes: number;
  activeApplications30d: number;
  plan: string;
  seatLimit: number;
  seatUsage: number;
};

function assertPlatformAdmin(ctx: AuthContext) {
  if (!isPlatformSuperAdmin(ctx)) {
    throw forbidden("Platform super admin access required");
  }
}

const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export async function getPlatformUsageAnalytics(ctx: AuthContext): Promise<TenantUsageRow[]> {
  assertPlatformAdmin(ctx);
  const since = thirtyDaysAgo();

  const orgs = await db.organization.findMany({
    where: customerOrganizationWhere(),
    orderBy: { createdAt: "desc" },
    include: {
      billing: true,
      _count: {
        select: {
          members: true,
          jobs: true,
          candidates: true,
          jobApplications: true,
          hiringOutcomes: true,
        },
      },
    },
  });

  const interviewCounts = await db.interview.groupBy({
    by: ["applicationId"],
    _count: { id: true },
    where: {
      application: { organization: customerOrganizationWhere() },
    },
  });

  const appOrgMap = await db.jobApplication.findMany({
    where: { organization: customerOrganizationWhere() },
    select: { id: true, organizationId: true, updatedAt: true },
  });

  const interviewsByOrg = new Map<string, number>();
  const activeAppsByOrg = new Map<string, number>();

  const appToOrg = new Map(appOrgMap.map((a) => [a.id, a.organizationId]));
  for (const row of interviewCounts) {
    const orgId = appToOrg.get(row.applicationId);
    if (!orgId) continue;
    interviewsByOrg.set(orgId, (interviewsByOrg.get(orgId) ?? 0) + row._count.id);
  }
  for (const app of appOrgMap) {
    if (app.updatedAt >= since) {
      activeAppsByOrg.set(
        app.organizationId,
        (activeAppsByOrg.get(app.organizationId) ?? 0) + 1
      );
    }
  }

  return orgs.map((org) => ({
    organizationId: org.id,
    name: org.name,
    slug: org.slug,
    members: org._count.members,
    jobs: org._count.jobs,
    candidates: org._count.candidates,
    applications: org._count.jobApplications,
    interviews: interviewsByOrg.get(org.id) ?? 0,
    outcomes: org._count.hiringOutcomes,
    activeApplications30d: activeAppsByOrg.get(org.id) ?? 0,
    plan: org.billing?.plan ?? "FREE",
    seatLimit: org.billing?.seatLimit ?? 5,
    seatUsage: org._count.members,
  }));
}

export async function getOrganizationUsageDetail(ctx: AuthContext, organizationId: string) {
  assertPlatformAdmin(ctx);
  const org = await db.organization.findFirst({
    where: { id: organizationId, ...customerOrganizationWhere() },
    include: {
      billing: true,
      _count: {
        select: {
          members: true,
          jobs: true,
          candidates: true,
          jobApplications: true,
          hiringOutcomes: true,
          emailNotifications: true,
          backgroundJobs: true,
        },
      },
    },
  });
  if (!org) throw notFound("Organization");

  const since = thirtyDaysAgo();
  const [recentApplications, recentInterviews, billingEvents] = await Promise.all([
    db.jobApplication.count({
      where: { organizationId, updatedAt: { gte: since } },
    }),
    db.interview.count({
      where: {
        application: { organizationId },
        updatedAt: { gte: since },
      },
    }),
    db.billingEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    organization: { id: org.id, name: org.name, slug: org.slug },
    counts: org._count,
    activity30d: {
      applications: recentApplications,
      interviews: recentInterviews,
    },
    billing: org.billing ?? {
      plan: "FREE",
      seatLimit: 5,
      seatUsage: org._count.members,
    },
    recentBillingEvents: billingEvents,
  };
}

export async function startImpersonation(ctx: AuthContext, organizationId: string) {
  assertPlatformAdmin(ctx);
  const org = await db.organization.findFirst({
    where: { id: organizationId, ...customerOrganizationWhere() },
    select: { id: true, name: true, slug: true },
  });
  if (!org) throw notFound("Organization");
  return org;
}

export async function getImpersonationState(ctx: AuthContext) {
  if (!isPlatformSuperAdmin(ctx) || !ctx.actingOrganizationId) {
    return { active: false as const };
  }
  const org = await db.organization.findFirst({
    where: { id: ctx.actingOrganizationId, ...customerOrganizationWhere() },
    select: { id: true, name: true, slug: true },
  });
  if (!org) return { active: false as const };
  return { active: true as const, organization: org };
}
