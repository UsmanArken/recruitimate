import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { unauthorized } from "@/lib/api/errors";
import {
  PLATFORM_SUPER_ADMIN_ROLE_CODE,
  SYSTEM_ORG_SLUG,
  customerOrganizationWhere,
  syncPlatformAdminOnLogin,
} from "@/lib/auth/platform-admin";
import { IMPERSONATE_ORG_COOKIE } from "@/lib/auth/impersonation";
import type { AuthContext } from "@/lib/auth/types";

async function resolveActingOrganizationId(
  isPlatformAdmin: boolean
): Promise<string | null> {
  if (!isPlatformAdmin) return null;
  const cookieStore = await cookies();
  const orgId = cookieStore.get(IMPERSONATE_ORG_COOKIE)?.value?.trim();
  if (!orgId) return null;

  const org = await db.organization.findFirst({
    where: { id: orgId, ...customerOrganizationWhere() },
    select: { id: true },
  });
  return org?.id ?? null;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await syncPlatformAdminOnLogin(session.user.id);

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: { role: true, organization: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) return null;

  const actingOrganizationId = await resolveActingOrganizationId(user.isPlatformAdmin);

  const systemMember = user.memberships.find(
    (m) => m.organization.slug === SYSTEM_ORG_SLUG
  );
  const member = user.isPlatformAdmin
    ? systemMember ?? user.memberships[0]
    : user.memberships[0];

  if (!member) return null;

  return {
    userId: user.id,
    organizationId: member.organizationId,
    memberId: member.id,
    roleId: member.roleId,
    roleCode: user.isPlatformAdmin
      ? PLATFORM_SUPER_ADMIN_ROLE_CODE
      : member.role.code,
    userEmail: user.email,
    userName: user.name,
    isPlatformAdmin: user.isPlatformAdmin,
    actingOrganizationId,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw unauthorized();
  return ctx;
}
