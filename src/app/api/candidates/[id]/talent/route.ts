import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import type { InterviewIntelligenceResult } from "@/lib/intelligence/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = await db.candidate.findUnique({
    where: { id },
    include: { job: true, interviews: { include: { analysis: true } } },
  });

  if (!candidate?.resumeText) {
    return NextResponse.json({ error: "No resume text" }, { status: 400 });
  }

  const talent = await analyzeTalent(
    candidate.resumeText,
    candidate.job?.title,
    candidate.job?.requirements
  );

  await db.talentProfile.upsert({
    where: { candidateId: id },
    create: {
      candidateId: id,
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

  const latestInterview = candidate.interviews.find((i) => i.analysis);
  const interviewResult: InterviewIntelligenceResult | null = latestInterview?.analysis
    ? {
        hesitationScore: latestInterview.analysis.hesitationScore ?? 0.5,
        confidenceScore: latestInterview.analysis.confidenceScore ?? 0.5,
        clarityScore: latestInterview.analysis.clarityScore ?? 0.5,
        consistencyScore: latestInterview.analysis.consistencyScore ?? 0.5,
        engagementScore: latestInterview.analysis.engagementScore ?? 0.5,
        cognitiveSignals: latestInterview.analysis.cognitiveSignals as InterviewIntelligenceResult["cognitiveSignals"],
        behavioralMetrics: latestInterview.analysis.behavioralMetrics as InterviewIntelligenceResult["behavioralMetrics"],
        riskFlags: latestInterview.analysis.riskFlags as InterviewIntelligenceResult["riskFlags"],
        explanation: latestInterview.analysis.explanation ?? "",
      }
    : null;

  const decision = await generateDecision(talent, interviewResult, candidate.name);

  await db.decision.upsert({
    where: { candidateId: id },
    create: {
      candidateId: id,
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

  return NextResponse.json({ talent, decision });
}
