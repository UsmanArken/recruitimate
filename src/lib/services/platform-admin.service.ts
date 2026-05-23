import { db } from "@/lib/db";
import { forbidden } from "@/lib/api/errors";
import {
  customerOrganizationWhere,
  isPlatformSuperAdmin,
} from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

function assertPlatformAdmin(ctx: AuthContext) {
  if (!isPlatformSuperAdmin(ctx)) {
    throw forbidden("Platform super admin access required");
  }
}

export async function listOrganizations(ctx: AuthContext) {
  assertPlatformAdmin(ctx);

  return db.organization.findMany({
    where: customerOrganizationWhere(),
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, jobs: true, candidates: true } },
    },
  });
}

export async function getPlatformStats(ctx: AuthContext) {
  assertPlatformAdmin(ctx);

  const customerOrg = customerOrganizationWhere();

  const [organizations, users, jobs, candidates] = await Promise.all([
    db.organization.count({ where: customerOrg }),
    db.user.count({
      where: {
        isPlatformAdmin: false,
        memberships: { some: { organization: customerOrg } },
      },
    }),
    db.job.count({ where: { organization: customerOrg } }),
    db.candidate.count({ where: { organization: customerOrg } }),
  ]);

  return { organizations, users, jobs, candidates };
}
