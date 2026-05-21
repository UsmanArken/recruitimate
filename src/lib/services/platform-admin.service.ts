import { db } from "@/lib/db";
import { forbidden } from "@/lib/api/errors";
import { isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

function assertPlatformAdmin(ctx: AuthContext) {
  if (!isPlatformSuperAdmin(ctx)) {
    throw forbidden("Platform super admin access required");
  }
}

export async function listOrganizations(ctx: AuthContext) {
  assertPlatformAdmin(ctx);

  return db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, jobs: true, candidates: true } },
    },
  });
}

export async function getPlatformStats(ctx: AuthContext) {
  assertPlatformAdmin(ctx);

  const [organizations, users, jobs, candidates] = await Promise.all([
    db.organization.count(),
    db.user.count(),
    db.job.count(),
    db.candidate.count(),
  ]);

  return { organizations, users, jobs, candidates };
}
