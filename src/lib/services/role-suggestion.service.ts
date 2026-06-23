import { db } from "@/lib/db";
import { organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { jobsWhereClause } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { estimateRoleFitHeuristic } from "@/lib/intelligence/talent/engine";

export type RoleSuggestion = {
  jobId: string;
  jobTitle: string;
  estimatedFit: number | null;
  reason: string;
};

/** Suggest open roles a candidate may fit — excludes roles they already applied to. */
export async function suggestRolesForCandidate(
  ctx: AuthContext,
  candidateId: string,
  resumeText: string
): Promise<RoleSuggestion[]> {
  await assertPermission(ctx, { resource: "candidates", action: "read" });

  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
    select: {
      applications: { select: { jobId: true } },
    },
  });
  if (!candidate) return [];

  const appliedIds = new Set(candidate.applications.map((a) => a.jobId));
  const jobWhere = await jobsWhereClause(ctx);

  const jobs = await db.job.findMany({
    where: jobWhere,
    select: { id: true, title: true, requirements: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  const suggestions: RoleSuggestion[] = [];

  for (const job of jobs) {
    if (appliedIds.has(job.id)) continue;

    const fit = estimateRoleFitHeuristic(resumeText, job.requirements);

    suggestions.push({
      jobId: job.id,
      jobTitle: job.title,
      estimatedFit: fit,
      reason:
        fit != null && fit >= 0.7
          ? "Strong keyword and experience overlap with this requisition"
          : fit != null && fit >= 0.5
            ? "Partial overlap — run a full screen to confirm fit"
            : "Limited overlap on requirements — review before applying",
    });
  }

  return suggestions
    .filter((s) => s.estimatedFit != null)
    .sort((a, b) => (b.estimatedFit ?? 0) - (a.estimatedFit ?? 0))
    .slice(0, 5);
}
