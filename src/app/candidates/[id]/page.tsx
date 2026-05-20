import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/layer-badge";
import { ScoreBadge } from "@/components/score-badge";
import { SignalList } from "@/components/signal-list";
import type { Signal } from "@/lib/intelligence/types";
import { InterviewForm } from "./interview-form";
import { ReanalyzeButton } from "./reanalyze-button";

export const dynamic = "force-dynamic";

const recLabels: Record<string, string> = {
  strong_yes: "Strong yes",
  yes: "Yes",
  maybe: "Maybe",
  no: "No",
  strong_no: "Strong no",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let candidate = null;

  try {
    candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        job: true,
        talentProfile: true,
        decision: true,
        interviews: { include: { analysis: true }, orderBy: { createdAt: "desc" } },
      },
    });
  } catch {
    notFound();
  }

  if (!candidate) notFound();

  const tp = candidate.talentProfile;
  const dec = candidate.decision;
  const latestInterview = candidate.interviews[0];
  const ia = latestInterview?.analysis;

  const hiddenSignals = (tp?.hiddenSignals ?? []) as Signal[];
  const riskFactors = (dec?.riskFactors ?? []) as Signal[];
  const cognitiveSignals = (ia?.cognitiveSignals ?? []) as Signal[];
  const behavioralMetrics = (ia?.behavioralMetrics ?? []) as Signal[];
  const interviewRisks = (ia?.riskFlags ?? []) as Signal[];

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-sm text-muted capitalize">
          {candidate.stage.replace(/_/g, " ")} · {candidate.job?.title ?? "No job"}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{candidate.name}</h1>
        {candidate.email && <p className="text-sm text-muted">{candidate.email}</p>}
      </header>

      {/* Layer 3: Decision — top summary */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <LayerBadge layer="decision" />
        </div>
        <Card className="border-emerald-200/60 bg-emerald-50/30">
          <CardHeader>
            <CardTitle>Hire recommendation</CardTitle>
            <CardDescription>
              Synthesized from talent + interview signals. Assistive — not a final verdict.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <ScoreBadge label="Hire confidence" score={dec?.hireConfidence} />
              <div className="rounded-lg border border-border/60 bg-background p-3">
                <p className="text-xs text-muted">Recommendation</p>
                <p className="mt-1 text-2xl font-semibold capitalize">
                  {dec?.recommendation ? recLabels[dec.recommendation] ?? dec.recommendation : "—"}
                </p>
              </div>
              <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
            </div>
            {dec?.explanation && (
              <p className="mt-4 rounded-lg bg-background p-3 text-sm leading-relaxed">
                {dec.explanation}
              </p>
            )}
            {riskFactors.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium">Risk factors</p>
                <SignalList signals={riskFactors} />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Layer 1: Talent */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <LayerBadge layer="talent" />
            <ReanalyzeButton candidateId={candidate.id} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Talent profile</CardTitle>
              <CardDescription>Pre-interview intelligence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
                <div className="rounded-lg border border-border/60 bg-background p-3">
                  <p className="text-xs text-muted">Experience</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {tp?.experienceYears != null ? `${tp.experienceYears}y` : "—"}
                  </p>
                </div>
              </div>
              {tp?.skills && (
                <div>
                  <p className="mb-2 text-sm font-medium">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(tp.skills as string[]).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {((tp?.strengths as string[] | undefined) ?? []).length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium text-emerald-700">Strengths</p>
                  <ul className="list-inside list-disc text-sm text-muted">
                    {((tp?.strengths as string[]) ?? []).map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {((tp?.gaps as string[] | undefined) ?? []).length > 0 && (
                <div>
                  <p className="mb-1 text-sm font-medium text-amber-700">Gaps</p>
                  <ul className="list-inside list-disc text-sm text-muted">
                    {((tp?.gaps as string[]) ?? []).map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
              {hiddenSignals.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Hidden signals</p>
                  <SignalList signals={hiddenSignals} />
                </div>
              )}
              {tp?.explanation && (
                <p className="text-xs text-muted italic">{tp.explanation}</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Layer 2: Interview */}
        <section>
          <div className="mb-3">
            <LayerBadge layer="interview" />
          </div>
          {ia ? (
            <Card>
              <CardHeader>
                <CardTitle>{latestInterview?.title ?? "Interview"}</CardTitle>
                <CardDescription>Post-interview signal analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <ScoreBadge label="Confidence" score={ia.confidenceScore} />
                  <ScoreBadge label="Clarity" score={ia.clarityScore} />
                  <ScoreBadge label="Hesitation" score={ia.hesitationScore} />
                  <ScoreBadge label="Consistency" score={ia.consistencyScore} />
                  <ScoreBadge label="Engagement" score={ia.engagementScore} />
                </div>
                {cognitiveSignals.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Cognitive signals</p>
                    <SignalList signals={cognitiveSignals} />
                  </div>
                )}
                {behavioralMetrics.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Behavioral metrics</p>
                    <SignalList signals={behavioralMetrics} />
                  </div>
                )}
                {interviewRisks.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Interview flags</p>
                    <SignalList signals={interviewRisks} />
                  </div>
                )}
                {ia.explanation && (
                  <p className="text-xs text-muted italic">{ia.explanation}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add interview</CardTitle>
                <CardDescription>
                  Paste a transcript for post-interview analysis (MVP). Recording upload in Phase 2.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewForm candidateId={candidate.id} />
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
