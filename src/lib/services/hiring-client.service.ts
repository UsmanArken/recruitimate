import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import type {
  CreateHiringClientInput,
  UpdateHiringClientInput,
} from "@/lib/validators/hiring-client";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "client";
}

async function uniqueSlug(organizationId: string, name: string): Promise<string> {
  let slug = slugify(name);
  let n = 0;
  while (
    await db.hiringClient.findUnique({
      where: { organizationId_slug: { organizationId, slug } },
    })
  ) {
    n += 1;
    slug = `${slugify(name)}-${n}`;
  }
  return slug;
}

export async function listHiringClients(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "org", action: "read" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  return db.hiringClient.findMany({
    where: { organizationId },
    include: { _count: { select: { jobs: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getHiringClientById(ctx: AuthContext, id: string) {
  await assertPermission(ctx, { resource: "org", action: "read" });
  const client = await db.hiringClient.findFirst({
    where: { id, ...organizationFilter(ctx) },
    include: { _count: { select: { jobs: true } } },
  });
  if (!client) throw notFound("Client company");
  return client;
}

export async function createHiringClient(ctx: AuthContext, input: CreateHiringClientInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "org", action: "update" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const slug = await uniqueSlug(organizationId, input.name);

  return db.hiringClient.create({
    data: {
      organizationId,
      name: input.name,
      slug,
      website: input.website || null,
      companyProfile: input.companyProfile?.trim() || null,
      impressionNotes: input.impressionNotes?.trim() || null,
      webDataConsentAt: input.webDataConsent ? new Date() : null,
    },
    include: { _count: { select: { jobs: true } } },
  });
}

export async function updateHiringClient(
  ctx: AuthContext,
  id: string,
  input: UpdateHiringClientInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "org", action: "update" });
  await getHiringClientById(ctx, id);

  const data: {
    name?: string;
    website?: string | null;
    companyProfile?: string | null;
    impressionNotes?: string | null;
    webDataConsentAt?: Date | null;
  } = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.website !== undefined) data.website = input.website || null;
  if (input.companyProfile !== undefined) data.companyProfile = input.companyProfile?.trim() || null;
  if (input.impressionNotes !== undefined) {
    data.impressionNotes = input.impressionNotes?.trim() || null;
  }
  if (input.webDataConsent !== undefined) {
    data.webDataConsentAt = input.webDataConsent ? new Date() : null;
  }

  return db.hiringClient.update({
    where: { id },
    data,
    include: { _count: { select: { jobs: true } } },
  });
}

export async function deleteHiringClient(ctx: AuthContext, id: string) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "org", action: "update" });
  const client = await getHiringClientById(ctx, id);
  if (client._count.jobs > 0) {
    throw badRequest(
      "Cannot delete a client company that still has open roles. Reassign or delete those roles first.",
      "CLIENT_HAS_JOBS"
    );
  }
  await db.hiringClient.delete({ where: { id } });
}
