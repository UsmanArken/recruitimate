import { db } from "@/lib/db";
import type { TalentIntelligenceResult } from "@/lib/intelligence/types";

export async function upsertTalentProfile(
  candidateId: string,
  talent: TalentIntelligenceResult
) {
  return db.talentProfile.upsert({
    where: { candidateId },
    create: {
      candidateId,
      skills: talent.skills,
      experienceYears: talent.experienceYears,
      roleFitScore: talent.roleFitScore,
      strengths: talent.strengths,
      gaps: talent.gaps,
      hiddenSignals: talent.hiddenSignals,
      explanation: talent.explanation,
      rawAnalysis: talent,
    },
    update: {
      skills: talent.skills,
      experienceYears: talent.experienceYears,
      roleFitScore: talent.roleFitScore,
      strengths: talent.strengths,
      gaps: talent.gaps,
      hiddenSignals: talent.hiddenSignals,
      explanation: talent.explanation,
      rawAnalysis: talent,
    },
  });
}
