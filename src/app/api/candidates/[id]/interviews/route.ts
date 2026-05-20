import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeInterview } from "@/lib/intelligence/interview/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";
import type { TalentIntelligenceResult } from "@/lib/intelligence/types";

const schema = z.object({
  title: z.string().min(1),
  transcript: z.string().min(50),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const candidate = await db.candidate.findUnique({
    where: { id },
    include: { talentProfile: true, job: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const analysis = await analyzeInterview(parsed.data.transcript, candidate.resumeText);

  const interview = await db.interview.create({
    data: {
      candidateId: id,
      title: parsed.data.title,
      status: "ANALYZED",
      transcript: parsed.data.transcript,
      analysis: {
        create: {
          hesitationScore: analysis.hesitationScore,
          confidenceScore: analysis.confidenceScore,
          clarityScore: analysis.clarityScore,
          consistencyScore: analysis.consistencyScore,
          engagementScore: analysis.engagementScore,
          cognitiveSignals: analysis.cognitiveSignals,
          behavioralMetrics: analysis.behavioralMetrics,
          riskFlags: analysis.riskFlags,
          explanation: analysis.explanation,
          rawAnalysis: analysis,
        },
      },
    },
    include: { analysis: true },
  });

  await db.candidate.update({
    where: { id },
    data: { stage: "INTERVIEWED" },
  });

  const talent: TalentIntelligenceResult | null = candidate.talentProfile
    ? {
        skills: candidate.talentProfile.skills as string[],
        experienceYears: candidate.talentProfile.experienceYears,
        roleFitScore: candidate.talentProfile.roleFitScore ?? 0.5,
        strengths: candidate.talentProfile.strengths as string[],
        gaps: candidate.talentProfile.gaps as string[],
        hiddenSignals: candidate.talentProfile.hiddenSignals as TalentIntelligenceResult["hiddenSignals"],
        explanation: candidate.talentProfile.explanation ?? "",
      }
    : null;

  const decision = await generateDecision(talent, analysis, candidate.name);

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

  return NextResponse.json({ interview, decision }, { status: 201 });
}
