import { db } from "@/lib/db";
import { candidateListInclude } from "@/lib/db/includes";
import { assertPermission } from "@/lib/auth/permission.service";
import { jobsWhereClause, candidatesWhereClause } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";

export async function getDashboardData(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });

  const [candidateWhere, jobWhere] = await Promise.all([
    candidatesWhereClause(ctx),
    jobsWhereClause(ctx),
  ]);

  const [candidateCount, jobCount, interviewedCount, decisions, recentCandidates] =
    await Promise.all([
      db.candidate.count({ where: candidateWhere }),
      db.job.count({ where: jobWhere }),
      db.candidate.count({
        where: { ...candidateWhere, stage: "INTERVIEWED" },
      }),
      db.decision.findMany({
        where: {
          candidate: candidateWhere,
          hireConfidence: { not: null },
        },
      }),
      db.candidate.findMany({
        where: candidateWhere,
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: candidateListInclude,
      }),
    ]);

  const avgConfidence =
    decisions.length > 0
      ? decisions.reduce((sum, d) => sum + (d.hireConfidence ?? 0), 0) / decisions.length
      : null;

  return {
    stats: {
      candidates: candidateCount,
      jobs: jobCount,
      interviewed: interviewedCount,
      avgConfidence,
    },
    recentCandidates,
  };
}
