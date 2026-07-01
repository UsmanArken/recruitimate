import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { notFound } from "@/lib/api/errors";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { canAccessJob } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { extractSkillsFromText } from "@/lib/intelligence/talent/skill-keywords";
import { getLaborMarketProvider } from "@/lib/labor-market/provider";
import { resolveLaborMarketProviderId } from "@/lib/labor-market/config";
import type { PassiveSignalsResult } from "@/lib/intelligence/types";

export async function getLaborMarketStatus() {
  return {
    provider: resolveLaborMarketProviderId(),
    httpConfigured: Boolean(process.env.LABOR_MARKET_API_URL?.trim()),
  };
}

export async function fetchPassiveSignalsForJob(
  ctx: AuthContext,
  jobId: string
): Promise<PassiveSignalsResult> {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  if (!(await canAccessJob(ctx, jobId))) {
    throw notFound("Job");
  }

  const job = await db.job.findFirst({
    where: { id: jobId, ...organizationFilter(ctx) },
    select: { id: true, title: true, requirements: true, organizationId: true },
  });
  if (!job) throw notFound("Job");

  const skills = extractSkillsFromText(`${job.title} ${job.requirements ?? ""}`);
  const provider = getLaborMarketProvider();
  const search = await provider.searchPassiveCandidates({
    jobId: job.id,
    title: job.title,
    requirements: job.requirements,
    skills,
  });

  const fetchedAt = new Date();

  // Replace cached leads for this job fetch
  await db.passiveCandidateLead.deleteMany({
    where: { organizationId: job.organizationId, jobId: job.id, provider: search.provider },
  });

  const created = await Promise.all(
    search.leads.map((lead) =>
      db.passiveCandidateLead.create({
        data: {
          organizationId: job.organizationId,
          jobId: job.id,
          provider: search.provider,
          externalRef: lead.externalRef,
          name: lead.name,
          headline: lead.headline,
          location: lead.location,
          skills: lead.skills as Prisma.InputJsonValue,
          signals: {
            opennessLikelihood: lead.opennessLikelihood,
            marketDemandScore: lead.marketDemandScore,
            skillScarcity: lead.skillScarcity,
            explanation: lead.explanation,
          } as Prisma.InputJsonValue,
          matchScore: lead.matchScore,
          fetchedAt,
        },
      })
    )
  );

  return {
    jobId: job.id,
    jobTitle: job.title,
    provider: search.provider,
    marketContext: search.marketContext,
    leads: created.map((row) => {
      const signals = (row.signals ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        externalRef: row.externalRef,
        name: row.name,
        headline: row.headline,
        location: row.location,
        skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
        opennessLikelihood: Number(signals.opennessLikelihood ?? 0),
        marketDemandScore: Number(signals.marketDemandScore ?? 0),
        skillScarcity: Number(signals.skillScarcity ?? 0),
        matchScore: row.matchScore ?? 0,
        provider: row.provider,
        explanation: String(signals.explanation ?? ""),
      };
    }),
    fetchedAt: fetchedAt.toISOString(),
  };
}

export async function listCachedPassiveSignals(
  ctx: AuthContext,
  jobId: string
): Promise<PassiveSignalsResult | null> {
  await assertPermission(ctx, { resource: "candidates", action: "read" });
  if (!(await canAccessJob(ctx, jobId))) return null;

  const job = await db.job.findFirst({
    where: { id: jobId, ...organizationFilter(ctx) },
    select: { id: true, title: true },
  });
  if (!job) return null;

  const leads = await db.passiveCandidateLead.findMany({
    where: { jobId, ...organizationFilter(ctx) },
    orderBy: [{ matchScore: "desc" }, { fetchedAt: "desc" }],
    take: 20,
  });
  if (leads.length === 0) return null;

  const provider = leads[0].provider;

  const skills = leads.flatMap((l) =>
    Array.isArray(l.skills) ? (l.skills as string[]) : []
  );
  const scarce = [...new Set(skills)].slice(0, 4) as string[];

  return {
    jobId: job.id,
    jobTitle: job.title,
    provider,
    marketContext: {
      demandScore:
        leads.reduce((sum: number, l) => {
          const s = l.signals as Record<string, unknown>;
          return sum + Number(s.marketDemandScore ?? 0);
        }, 0) / leads.length,
      talentPoolEstimate: leads.length * 12,
      scarceSkills: scarce,
      averageOpenness:
        leads.reduce((sum: number, l) => {
          const s = l.signals as Record<string, unknown>;
          return sum + Number(s.opennessLikelihood ?? 0);
        }, 0) / leads.length,
      explanation: `Cached passive signals from ${provider} provider.`,
    },
    leads: leads.map((row) => {
      const signals = (row.signals ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        externalRef: row.externalRef,
        name: row.name,
        headline: row.headline,
        location: row.location,
        skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
        opennessLikelihood: Number(signals.opennessLikelihood ?? 0),
        marketDemandScore: Number(signals.marketDemandScore ?? 0),
        skillScarcity: Number(signals.skillScarcity ?? 0),
        matchScore: row.matchScore ?? 0,
        provider: row.provider,
        explanation: String(signals.explanation ?? ""),
      };
    }),
    fetchedAt: leads[0].fetchedAt.toISOString(),
  };
}

export async function refreshPassiveSignals(ctx: AuthContext, jobId: string) {
  assertTenantWorkspaceWrite(ctx);
  return fetchPassiveSignalsForJob(ctx, jobId);
}
