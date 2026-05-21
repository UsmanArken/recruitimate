import { db } from "@/lib/db";
import { forbidden, unauthorized } from "@/lib/api/errors";
import { isPlatformSuperAdmin } from "@/lib/auth/platform-admin";
import type { AuthContext, PermissionCheck } from "@/lib/auth/types";

const JOB_INTERVIEWER_ROLE_CODE = "JOB_INTERVIEWER";

/** In-memory cache per process; invalidate on role permission admin changes (Phase 2). */
const rolePermissionCache = new Map<string, Set<string>>();

export async function loadPermissionCodesForRole(roleId: string): Promise<Set<string>> {
  const cached = rolePermissionCache.get(roleId);
  if (cached) return cached;

  const links = await db.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });
  const codes = new Set(links.map((l) => l.permission.code));
  rolePermissionCache.set(roleId, codes);
  return codes;
}

export function clearPermissionCache() {
  rolePermissionCache.clear();
}

function resolvePermissionCodes(check: PermissionCheck): string[] {
  const { resource, action } = check;
  const codes = [`${resource}.${action}`];
  if (action === "read") {
    codes.push(`${resource}.read_all`, `${resource}.read_assigned`);
  }
  if (action === "read" && resource === "jobs") {
    codes.push("jobs.read_all", "jobs.read_assigned");
  }
  return codes;
}

/** Merge org role permissions with job-assignment role (interviewer) from database rules. */
export async function getEffectivePermissionCodes(
  ctx: AuthContext,
  jobId?: string
): Promise<Set<string>> {
  const codes = new Set(await loadPermissionCodesForRole(ctx.roleId));

  if (jobId) {
    const assignment = await db.jobAssignment.findFirst({
      where: { jobId, userId: ctx.userId },
    });
    if (assignment?.assignmentRole === "INTERVIEWER") {
      const jobRole = await db.role.findUnique({
        where: { code: JOB_INTERVIEWER_ROLE_CODE },
      });
      if (jobRole) {
        const jobCodes = await loadPermissionCodesForRole(jobRole.id);
        jobCodes.forEach((c) => codes.add(c));
      }
    }
  }

  return codes;
}

export async function hasPermission(
  ctx: AuthContext,
  check: PermissionCheck
): Promise<boolean> {
  if (isPlatformSuperAdmin(ctx)) return true;
  const effective = await getEffectivePermissionCodes(ctx, check.jobId);
  const candidates = resolvePermissionCodes(check);
  return candidates.some((code) => effective.has(code));
}

export async function assertPermission(
  ctx: AuthContext,
  check: PermissionCheck
): Promise<void> {
  if (!(await hasPermission(ctx, check))) {
    throw forbidden(`Missing permission: ${check.resource}.${check.action}`);
  }
}

export async function assertAuthenticated(ctx: AuthContext | null): Promise<AuthContext> {
  if (!ctx) throw unauthorized();
  return ctx;
}
