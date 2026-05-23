import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { forbidden } from "@/lib/api/errors";
import { db } from "@/lib/db";
import type { AuthContext } from "@/lib/auth/types";

export const SYSTEM_ORG_SLUG = "recruitimate-platform";
export const SYSTEM_ORG_NAME = "Recruitimate Platform";
export const PLATFORM_SUPER_ADMIN_ROLE_CODE = "PLATFORM_SUPER_ADMIN";

export function configuredSuperAdminEmail(): string | null {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function seedSuperAdminEmail(): string {
  return configuredSuperAdminEmail() ?? "admin@recruitimate.local";
}

export function seedSuperAdminPassword(): string {
  return process.env.SUPER_ADMIN_PASSWORD ?? "ChangeMeInProduction!12";
}

export function isReservedSuperAdminEmail(email: string): boolean {
  const reserved = configuredSuperAdminEmail();
  return Boolean(reserved && email.toLowerCase() === reserved);
}

export function isPlatformSuperAdmin(ctx: AuthContext): boolean {
  return ctx.isPlatformAdmin === true;
}

/** Customer tenants only (excludes internal platform org from SaaS metrics). */
export function customerOrganizationWhere(): Prisma.OrganizationWhereInput {
  return { slug: { not: SYSTEM_ORG_SLUG } };
}

/** Platform operators browse all tenants but cannot mutate hiring data without impersonation. */
export function isPlatformReadOnlyWorkspace(ctx: AuthContext): boolean {
  return isPlatformSuperAdmin(ctx) && !ctx.actingOrganizationId;
}

export function assertTenantWorkspaceWrite(ctx: AuthContext): void {
  if (!isPlatformReadOnlyWorkspace(ctx)) return;
  throw forbidden(
    "Platform operators cannot change hiring data in the workspace. Use Platform admin or impersonate a tenant.",
    "TENANT_CONTEXT_REQUIRED"
  );
}

/** Org filter for tenant-scoped queries; empty for platform super admin (all tenants). */
export function organizationFilter(
  ctx: AuthContext
): { organizationId: string } | Record<string, never> {
  if (isPlatformSuperAdmin(ctx)) return {};
  return { organizationId: ctx.organizationId };
}

export async function ensurePlatformAdminUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ userId: string; organizationId: string }> {
  const email = input.email.toLowerCase();
  const role = await db.role.findUnique({
    where: { code: PLATFORM_SUPER_ADMIN_ROLE_CODE },
  });
  if (!role) {
    throw new Error("PLATFORM_SUPER_ADMIN role missing. Run npm run db:seed");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return db.$transaction(async (tx) => {
    const organization = await tx.organization.upsert({
      where: { slug: SYSTEM_ORG_SLUG },
      create: { name: SYSTEM_ORG_NAME, slug: SYSTEM_ORG_SLUG },
      update: {},
    });

    const user = await tx.user.upsert({
      where: { email },
      create: {
        email,
        name: input.name ?? "Platform Super Admin",
        passwordHash,
        isPlatformAdmin: true,
      },
      update: {
        isPlatformAdmin: true,
        passwordHash,
        name: input.name ?? undefined,
      },
    });

    await tx.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: user.id,
        },
      },
      create: {
        organizationId: organization.id,
        userId: user.id,
        roleId: role.id,
      },
      update: { roleId: role.id },
    });

    return { userId: user.id, organizationId: organization.id };
  });
}

/** Promote env-configured email on login (production bootstrap). */
export async function syncPlatformAdminOnLogin(userId: string): Promise<void> {
  const reserved = configuredSuperAdminEmail();
  if (!reserved) return;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.email.toLowerCase() !== reserved) return;

  const role = await db.role.findUnique({
    where: { code: PLATFORM_SUPER_ADMIN_ROLE_CODE },
  });
  if (!role) return;

  const organization = await db.organization.upsert({
    where: { slug: SYSTEM_ORG_SLUG },
    create: { name: SYSTEM_ORG_NAME, slug: SYSTEM_ORG_SLUG },
    update: {},
  });

  await db.user.update({
    where: { id: userId },
    data: { isPlatformAdmin: true },
  });

  await db.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId,
      },
    },
    create: {
      organizationId: organization.id,
      userId,
      roleId: role.id,
    },
    update: { roleId: role.id },
  });
}
