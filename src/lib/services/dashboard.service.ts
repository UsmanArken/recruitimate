import { db } from "@/lib/db";
import { candidateListInclude } from "@/lib/db/includes";

export async function getDashboardData() {
  const [candidateCount, jobCount, interviewedCount, decisions, recentCandidates] =
    await Promise.all([
      db.candidate.count(),
      db.job.count(),
      db.candidate.count({ where: { stage: "INTERVIEWED" } }),
      db.decision.findMany({ where: { hireConfidence: { not: null } } }),
      db.candidate.findMany({
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
