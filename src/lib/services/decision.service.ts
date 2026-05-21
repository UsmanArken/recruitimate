import { db } from "@/lib/db";
import type { DecisionIntelligenceResult } from "@/lib/intelligence/types";

export async function upsertDecision(
  candidateId: string,
  decision: DecisionIntelligenceResult
) {
  return db.decision.upsert({
    where: { candidateId },
    create: {
      candidateId,
      hireConfidence: decision.hireConfidence,
      recommendation: decision.recommendation,
      riskFactors: decision.riskFactors,
      explanation: decision.explanation,
      signalBreakdown: decision.signalBreakdown,
    },
    update: {
      hireConfidence: decision.hireConfidence,
      recommendation: decision.recommendation,
      riskFactors: decision.riskFactors,
      explanation: decision.explanation,
      signalBreakdown: decision.signalBreakdown,
    },
  });
}
