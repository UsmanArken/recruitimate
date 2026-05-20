import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { analyzeTalent } from "@/lib/intelligence/talent/engine";
import { generateDecision } from "@/lib/intelligence/decision/engine";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  jobId: z.string().optional(),
  resumeText: z.string().min(20),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const candidates = await db.candidate.findMany({
    include: {
      job: true,
      talentProfile: true,
      decision: true,
      _count: { select: { interviews: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(candidates);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, jobId, resumeText, linkedInUrl, githubUrl } = parsed.data;

  const job = jobId
    ? await db.job.findUnique({ where: { id: jobId } })
    : null;

  const talent = await analyzeTalent(resumeText, job?.title, job?.requirements);
  const decision = await generateDecision(talent, null, name);

  const candidate = await db.candidate.create({
    data: {
      name,
      email: email || null,
      jobId: jobId || null,
      resumeText,
      linkedInUrl: linkedInUrl || null,
      githubUrl: githubUrl || null,
      stage: "TALENT_REVIEW",
      talentProfile: {
        create: {
          skills: talent.skills,
          experienceYears: talent.experienceYears,
          roleFitScore: talent.roleFitScore,
          strengths: talent.strengths,
          gaps: talent.gaps,
          hiddenSignals: talent.hiddenSignals,
          explanation: talent.explanation,
          rawAnalysis: talent,
        },
      },
      decision: {
        create: {
          hireConfidence: decision.hireConfidence,
          recommendation: decision.recommendation,
          riskFactors: decision.riskFactors,
          explanation: decision.explanation,
          signalBreakdown: decision.signalBreakdown,
        },
      },
    },
    include: { talentProfile: true, decision: true, job: true },
  });

  return NextResponse.json(candidate, { status: 201 });
}
