import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";

const INVITE_TTL_DAYS = 7;

export async function createInvite(
  ctx: AuthContext,
  input: { email: string; roleCode: string }
) {
  await assertPermission(ctx, { resource: "members", action: "invite" });

  const role = await db.role.findFirst({
    where: {
      code: input.roleCode,
      scope: "ORGANIZATION",
    },
  });
  if (!role) throw badRequest("Invalid organization role", "INVALID_ROLE");

  if (role.code === "ORG_OWNER") {
    throw badRequest("Cannot invite another owner", "INVALID_ROLE");
  }

  const email = input.email.toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  return db.invite.create({
    data: {
      email,
      token,
      organizationId: ctx.organizationId,
      roleId: role.id,
      invitedById: ctx.userId,
      expiresAt,
    },
    include: { role: true },
  });
}

export async function listInvites(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "members", action: "read" });
  return db.invite.findMany({
    where: {
      organizationId: ctx.organizationId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInviteByToken(token: string) {
  const invite = await db.invite.findUnique({
    where: { token },
    include: { organization: true, role: true },
  });
  if (!invite) throw notFound("Invite");
  if (invite.acceptedAt) throw badRequest("Invite already used", "INVITE_USED");
  if (invite.expiresAt < new Date()) throw badRequest("Invite expired", "INVITE_EXPIRED");
  return invite;
}

export async function acceptInvite(input: {
  token: string;
  name: string;
  password: string;
}) {
  const invite = await getInviteByToken(input.token);
  const email = invite.email.toLowerCase();

  let user = await db.user.findUnique({ where: { email } });
  const bcrypt = await import("bcryptjs");

  if (user) {
    const existingMember = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invite.organizationId,
          userId: user.id,
        },
      },
    });
    if (existingMember) throw badRequest("Already a member of this organization", "ALREADY_MEMBER");
  } else {
    const passwordHash = await bcrypt.hash(input.password, 12);
    user = await db.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
      },
    });
  }

  await db.$transaction([
    db.organizationMember.create({
      data: {
        userId: user!.id,
        organizationId: invite.organizationId,
        roleId: invite.roleId,
      },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return { user, organization: invite.organization, role: invite.role };
}

export async function listOrgRoles() {
  return db.role.findMany({
    where: { scope: "ORGANIZATION" },
    orderBy: { code: "asc" },
  });
}
