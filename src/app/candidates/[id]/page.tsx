import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/layer-badge";
import { ScoreBadge } from "@/components/score-badge";
import { SignalList } from "@/components/signal-list";
import { RecommendationBadge } from "@/components/recommendation-badge";
import { TrustBanner } from "@/components/trust-banner";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/avatar";
import { PageBody } from "@/components/page-header";
import type { Signal } from "@/lib/intelligence/types";
import { InterviewForm } from "./interview-form";
import { ReanalyzeButton } from "./reanalyze-button";
import { ChevronLeft, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <>
      <div className="border-b border-border bg-card px-8 py-6">
        <Link
          href="/candidates"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to candidates
        </Link>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={candidate.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StageBadge stage={candidate.stage} />
              {candidate.job && (
                <span className="text-sm text-muted">· {candidate.job.title}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
            {candidate.email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <PageBody>
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <LayerBadge layer="decision" />
          </div>
          <Card className="overflow-hidden border-decision/30">
            <div className="bg-decision-bg px-6 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-decision">
                Hiring recommendation
              </p>
            </div>
            <CardHeader className="border-b-0 pb-0">
              <CardDescription>
                Advisory summary for your hiring committee — synthesized from talent and interview
                intelligence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TrustBanner>
                This recommendation assists your decision; it does not replace recruiter judgment
                or compliance review.
              </TrustBanner>
              <div className="grid gap-4 sm:grid-cols-3">
                <ScoreBadge label="Hire confidence" score={dec?.hireConfidence} />
                <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Recommendation
                  </p>
                  <div className="mt-2">
                    <RecommendationBadge value={dec?.recommendation} />
                  </div>
                </div>
                <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
              </div>
              {dec?.explanation && (
                <div className="rounded-lg border border-border-subtle bg-background p-4">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted">Summary</p>
                  <p className="text-sm leading-relaxed">{dec.explanation}</p>
                </div>
              )}
              {riskFactors.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-risk">Items to discuss</p>
                  <SignalList signals={riskFactors} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <LayerBadge layer="talent" />
              <ReanalyzeButton candidateId={candidate.id} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Talent profile</CardTitle>
                <CardDescription>Pre-interview intelligence from resume and role match</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
                  <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Experience
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {tp?.experienceYears != null ? `${tp.experienceYears} years` : "—"}
                    </p>
                  </div>
                </div>
                {tp?.skills && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Matched skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(tp.skills as string[]).map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-talent-bg px-2.5 py-1 text-xs font-medium text-talent"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {((tp?.strengths as string[] | undefined) ?? []).length > 0 && (
                  <div className="rounded-lg bg-success-bg/50 p-4">
                    <p className="mb-2 text-sm font-semibold text-success">Strengths</p>
                    <ul className="space-y-1 text-sm text-foreground/90">
                      {((tp?.strengths as string[]) ?? []).map((s) => (
                        <li key={s}>· {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {((tp?.gaps as string[] | undefined) ?? []).length > 0 && (
                  <div className="rounded-lg bg-warning-bg/50 p-4">
                    <p className="mb-2 text-sm font-semibold text-warning">Gaps to probe</p>
                    <ul className="space-y-1 text-sm text-foreground/90">
                      {((tp?.gaps as string[]) ?? []).map((g) => (
                        <li key={g}>· {g}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {hiddenSignals.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">Additional signals</p>
                    <SignalList signals={hiddenSignals} />
                  </div>
                )}
                {tp?.explanation && (
                  <p className="text-xs italic text-muted">{tp.explanation}</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <div className="mb-3">
              <LayerBadge layer="interview" />
            </div>
            {ia ? (
              <Card>
                <CardHeader>
                  <CardTitle>{latestInterview?.title ?? "Interview"}</CardTitle>
                  <CardDescription>Post-interview signal report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <ScoreBadge label="Confidence" score={ia.confidenceScore} />
                    <ScoreBadge label="Clarity" score={ia.clarityScore} />
                    <ScoreBadge label="Hesitation" score={ia.hesitationScore} invertBar />
                    <ScoreBadge label="Consistency" score={ia.consistencyScore} />
                    <ScoreBadge label="Engagement" score={ia.engagementScore} />
                  </div>
                  {cognitiveSignals.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold">Cognitive signals</p>
                      <SignalList signals={cognitiveSignals} />
                    </div>
                  )}
                  {behavioralMetrics.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold">Behavioral observations</p>
                      <SignalList signals={behavioralMetrics} />
                    </div>
                  )}
                  {interviewRisks.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-warning">Follow-up suggested</p>
                      <SignalList signals={interviewRisks} />
                    </div>
                  )}
                  {ia.explanation && (
                    <p className="text-xs italic text-muted">{ia.explanation}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Record interview</CardTitle>
                  <CardDescription>
                    Paste a transcript to generate your interview intelligence report. Audio upload
                    coming in a later release.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterviewForm candidateId={candidate.id} />
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </PageBody>
    </>
  );
}
