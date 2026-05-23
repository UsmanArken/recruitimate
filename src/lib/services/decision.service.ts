import { db } from "@/lib/db";
import type { DecisionIntelligenceResult } from "@/lib/intelligence/types";

export async function upsertDecision(
  applicationId: string,
  decision: DecisionIntelligenceResult
) {
  return db.decision.upsert({
    where: { applicationId },
    create: {
      applicationId,
      hireConfidence: decision.hireConfidence ?? null,
      recommendation: decision.recommendation,
      riskFactors: decision.riskFactors,
      explanation: decision.explanation,
      signalBreakdown: decision.signalBreakdown,
    },
    update: {
      hireConfidence: decision.hireConfidence ?? null,
      recommendation: decision.recommendation,
      riskFactors: decision.riskFactors,
      explanation: decision.explanation,
      signalBreakdown: decision.signalBreakdown,
    },
  });
}
