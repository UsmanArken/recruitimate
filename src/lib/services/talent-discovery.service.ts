import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { candidatesWhereClause } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import {
  buildDiscoveryDocument,
  discoveryIngestExplanation,
  mapPrismaSource,
  mapPrismaSourceToDiscovery,
} from "@/lib/intelligence/talent/discovery-engine";
import type { TalentDiscoveryIngestResult } from "@/lib/intelligence/types";
import type {
  createTalentPoolSchema,
  talentIngestSchema,
} from "@/lib/validators/talent-discovery";
import type { z } from "zod";

export type CreateTalentPoolInput = z.infer<typeof createTalentPoolSchema>;
export type TalentIngestInput = z.infer<typeof talentIngestSchema>;

export async function listTalentPools(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  return db.talentPool.findMany({
    where: organizationFilter(ctx),
    include: { _count: { select: { members: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createTalentPool(ctx: AuthContext, input: CreateTalentPoolInput) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  const existing = await db.talentPool.findFirst({
    where: { organizationId, name: input.name },
  });
  if (existing) {
    throw badRequest("A talent pool with this name already exists", "POOL_EXISTS");
  }

  return db.talentPool.create({
    data: {
      organizationId,
      name: input.name,
      description: input.description?.trim() || null,
    },
    include: { _count: { select: { members: true } } },
  });
}

async function assertPoolAccess(ctx: AuthContext, poolId: string) {
  const pool = await db.talentPool.findFirst({
    where: { id: poolId, ...organizationFilter(ctx) },
  });
  if (!pool) throw notFound("Talent pool");
  return pool;
}

export async function addCandidateToPool(
  ctx: AuthContext,
  poolId: string,
  candidateId: string
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertPoolAccess(ctx, poolId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
  });
  if (!candidate) throw notFound("Candidate");

  return db.talentPoolMember.upsert({
    where: { poolId_candidateId: { poolId, candidateId } },
    create: { poolId, candidateId },
    update: {},
  });
}

export async function indexCandidateForDiscovery(
  ctx: AuthContext,
  candidateId: string
) {
  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
  });
  if (!candidate) throw notFound("Candidate");

  const doc = buildDiscoveryDocument(candidate);
  await db.candidate.update({
    where: { id: candidateId },
    data: {
      searchDocument: doc.searchDocument || null,
      searchSkills: doc.searchSkills as Prisma.InputJsonValue,
      discoveryIndexedAt: new Date(),
    },
  });
  return doc;
}

export async function ingestTalentProfile(
  ctx: AuthContext,
  input: TalentIngestInput
): Promise<TalentDiscoveryIngestResult> {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "create" });
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;

  if (input.poolId) {
    await assertPoolAccess(ctx, input.poolId);
  }

  const doc = buildDiscoveryDocument(input);
  if (doc.searchDocument.length < 20) {
    throw badRequest(
      "Provide resume or LinkedIn text (at least 20 characters) for discovery indexing",
      "INSUFFICIENT_PROFILE_TEXT"
    );
  }

  const candidate = await db.candidate.create({
    data: {
      organizationId,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      resumeText: input.resumeText?.trim() || null,
      linkedInText: input.linkedInText?.trim() || null,
      linkedInUrl: input.linkedInUrl?.trim() || null,
      githubUrl: input.githubUrl?.trim() || null,
      portfolioUrl: input.portfolioUrl?.trim() || null,
      source: mapPrismaSource(input.source),
      searchDocument: doc.searchDocument,
      searchSkills: doc.searchSkills as Prisma.InputJsonValue,
      discoveryIndexedAt: new Date(),
    },
  });

  if (input.poolId) {
    await db.talentPoolMember.create({
      data: { poolId: input.poolId, candidateId: candidate.id },
    });
  }

  return {
    candidateId: candidate.id,
    poolId: input.poolId ?? null,
    source: input.source,
    searchSkills: doc.searchSkills,
    experienceYears: doc.experienceYears,
    explanation: discoveryIngestExplanation(input.source, doc.searchSkills.length),
  };
}

export async function reindexOrganizationTalent(ctx: AuthContext, poolId?: string) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const where = await candidatesWhereClause(ctx);

  const candidates = await db.candidate.findMany({
    where: poolId
      ? {
          ...where,
          poolMemberships: { some: { poolId } },
        }
      : where,
    select: {
      id: true,
      resumeText: true,
      linkedInText: true,
      linkedInUrl: true,
      githubUrl: true,
      portfolioUrl: true,
    },
  });

  let indexed = 0;
  for (const c of candidates) {
    const doc = buildDiscoveryDocument(c);
    if (doc.searchDocument.length < 10) continue;
    await db.candidate.update({
      where: { id: c.id },
      data: {
        searchDocument: doc.searchDocument,
        searchSkills: doc.searchSkills as Prisma.InputJsonValue,
        discoveryIndexedAt: new Date(),
      },
    });
    indexed += 1;
  }

  return { indexed, total: candidates.length };
}

export async function loadSearchableCandidates(ctx: AuthContext, poolId?: string) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  const where = await candidatesWhereClause(ctx);

  const candidates = await db.candidate.findMany({
    where: poolId
      ? {
          ...where,
          poolMemberships: { some: { poolId } },
        }
      : where,
    select: {
      id: true,
      name: true,
      email: true,
      searchDocument: true,
      searchSkills: true,
      resumeText: true,
      linkedInText: true,
      linkedInUrl: true,
      githubUrl: true,
      portfolioUrl: true,
      source: true,
      applications: { select: { jobId: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return candidates.map((c) => {
    const doc =
      c.searchDocument?.trim() ||
      buildDiscoveryDocument(c).searchDocument;
    const skills = Array.isArray(c.searchSkills)
      ? (c.searchSkills as string[])
      : buildDiscoveryDocument(c).searchSkills;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      searchDocument: doc,
      searchSkills: skills,
      experienceYears: buildDiscoveryDocument(c).experienceYears,
      source: mapPrismaSourceToDiscovery(c.source),
      jobIds: c.applications.map((a) => a.jobId),
    };
  });
}
