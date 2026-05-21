import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized } from "@/lib/api/errors";
import type { AuthContext } from "@/lib/auth/types";

export async function getSession() {
  return auth();
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    include: { role: true, user: true },
    orderBy: { createdAt: "asc" },
  });

  if (!member) return null;

  return {
    userId: member.userId,
    organizationId: member.organizationId,
    memberId: member.id,
    roleId: member.roleId,
    roleCode: member.role.code,
    userEmail: member.user.email,
    userName: member.user.name,
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw unauthorized();
  return ctx;
}
