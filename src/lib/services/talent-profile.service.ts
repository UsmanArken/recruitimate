import { db } from "@/lib/db";
import type { TalentIntelligenceResult } from "@/lib/intelligence/types";

export async function upsertTalentProfile(
  applicationId: string,
  talent: TalentIntelligenceResult
) {
  return db.talentProfile.upsert({
    where: { applicationId },
    create: {
      applicationId,
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
