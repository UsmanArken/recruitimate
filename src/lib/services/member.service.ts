import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import type { UpdateMemberRoleInput } from "@/lib/validators/member";

export async function listOrganizationMembers(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "members", action: "read" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  return db.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: {
        select: {
          id: true,
          code: true,
          name: true,
          permissions: {
            include: { permission: { select: { code: true, description: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listOrganizationRolesWithPermissions() {
  return db.role.findMany({
    where: { scope: "ORGANIZATION" },
    include: {
      permissions: {
        include: { permission: { select: { code: true, description: true } } },
      },
    },
    orderBy: { code: "asc" },
  });
}

export async function updateMemberRole(
  ctx: AuthContext,
  memberId: string,
  input: UpdateMemberRoleInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "members", action: "update" });

  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const member = await db.organizationMember.findFirst({
    where: { id: memberId, organizationId },
    include: { role: true, user: true },
  });
  if (!member) throw notFound("Member");

  if (member.userId === ctx.userId && member.role.code === "ORG_OWNER") {
    throw badRequest("You cannot change your own owner role", "OWNER_SELF_UPDATE");
  }

  const role = await db.role.findFirst({
    where: { code: input.roleCode, scope: "ORGANIZATION" },
  });
  if (!role) throw badRequest("Invalid role", "INVALID_ROLE");

  if (role.code === "ORG_OWNER" && ctx.roleCode !== "ORG_OWNER") {
    throw badRequest("Only organization owners can assign the owner role", "FORBIDDEN");
  }

  if (member.role.code === "ORG_OWNER" && role.code !== "ORG_OWNER") {
    const ownerCount = await db.organizationMember.count({
      where: { organizationId, role: { code: "ORG_OWNER" } },
    });
    if (ownerCount <= 1) {
      throw badRequest("Cannot remove the last organization owner", "LAST_OWNER");
    }
  }

  return db.organizationMember.update({
    where: { id: memberId },
    data: { roleId: role.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: { select: { id: true, code: true, name: true } },
    },
  });
}
