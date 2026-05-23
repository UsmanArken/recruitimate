import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/api/errors";
import {
  PLATFORM_SUPER_ADMIN_ROLE_CODE,
  SYSTEM_ORG_SLUG,
  syncPlatformAdminOnLogin,
} from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

export async function getSession() {
  return auth();
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
    actingOrganizationId: null,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw unauthorized();
  return ctx;
}
