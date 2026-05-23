import { db } from "@/lib/db";
import { applicationListInclude } from "@/lib/db/includes";
import { assertPermission } from "@/lib/auth/permission.service";
import {
  applicationsWhereClause,
  candidatesWhereClause,
  jobsWhereClause,
} from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";

export async function getDashboardData(ctx: AuthContext) {
  await assertPermission(ctx, { resource: "candidates", action: "read" });

  const [applicationWhere, candidateWhere, jobWhere] = await Promise.all([
    applicationsWhereClause(ctx),
    candidatesWhereClause(ctx),
    jobsWhereClause(ctx),
  ]);

  const [candidateCount, applicationCount, jobCount, interviewedCount, decisions, recentApplications] =
    await Promise.all([
      db.candidate.count({ where: candidateWhere }),
      db.jobApplication.count({ where: applicationWhere }),
      db.job.count({ where: jobWhere }),
      db.jobApplication.count({
        where: { ...applicationWhere, stage: "INTERVIEWED" },
      }),
      db.decision.findMany({
        where: {
          application: applicationWhere,
          hireConfidence: { not: null },
        },
      }),
      db.jobApplication.findMany({
        where: applicationWhere,
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: applicationListInclude,
      }),
    ]);

  const avgConfidence =
    decisions.length > 0
      ? decisions.reduce((sum, d) => sum + (d.hireConfidence ?? 0), 0) / decisions.length
      : null;

  return {
    stats: {
      candidates: candidateCount,
      applications: applicationCount,
      jobs: jobCount,
      interviewed: interviewedCount,
      avgConfidence,
    },
    recentApplications,
  };
}
