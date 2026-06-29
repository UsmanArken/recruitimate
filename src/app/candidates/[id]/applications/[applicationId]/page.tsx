import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getApplicationById } from "@/lib/services/application.service";
import { getIntelligencePhase } from "@/lib/intelligence/candidate-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { IntelligencePhasePanel } from "@/components/features/candidates/intelligence-phase-panel";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { Avatar } from "@/components/features/candidates/avatar";
import { InterviewWorkflowPanel } from "@/components/features/candidates/interview-workflow-panel";
import {
  InterviewerQualityPanel,
  parseInterviewerQuality,
} from "@/components/features/interview/interviewer-quality-panel";
import {
  AudioSignalsPanel,
  parseAudioSignals,
} from "@/components/features/interview/audio-signals-panel";
import {
  VideoBehavioralPanel,
  parseVideoBehavioralMetrics,
} from "@/components/features/interview/video-behavioral-panel";
import { ApplicationAssessmentPanel } from "@/components/features/assessment/application-assessment-panel";
import { ReanalyzeButton } from "@/components/features/candidates/reanalyze-button";
import { CandidateBriefExportButton } from "@/components/features/candidates/candidate-brief-document";
import { OutcomePanel } from "@/components/features/learning/outcome-panel";
import { RecommendationFeedbackPanel } from "@/components/features/learning/recommendation-feedback";
import { SuccessPredictionPanel } from "@/components/features/learning/success-prediction-panel";
import { PageBody } from "@/components/layout/page-header";
import type { Signal } from "@/lib/intelligence/types";
import { Briefcase, ChevronLeft, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id: candidateId, applicationId } = await params;

  let application: Awaited<ReturnType<typeof getApplicationById>> | null = null;
  let readOnly = false;
  let ctxUserId: string | null = null;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
    ctxUserId = ctx.userId;
    application = await getApplicationById(ctx, applicationId);
  } catch {
    notFound();
  }

  if (!application || application.candidateId !== candidateId) notFound();

  const candidate = application.candidate;
  const tp = application.talentProfile;
  const dec = application.decision;
  const latestInterview = application.interviews[0];
  const ia = latestInterview?.analysis;

  const phase = getIntelligencePhase(application.jobId, Boolean(ia));

  const hiddenSignals = (tp?.hiddenSignals ?? []) as Signal[];
  const riskFactors = (dec?.riskFactors ?? []) as Signal[];
  const cognitiveSignals = (ia?.cognitiveSignals ?? []) as Signal[];
  const behavioralMetrics = (ia?.behavioralMetrics ?? []) as Signal[];
  const interviewRisks = (ia?.riskFlags ?? []) as Signal[];
  const interviewerQuality = parseInterviewerQuality(ia?.interviewerQuality);
  const audioSignals = parseAudioSignals(latestInterview?.audioSignals);
  const videoBehavioral = parseVideoBehavioralMetrics(latestInterview?.videoBehavioralMetrics);
  const outcome = application.outcome
    ? {
        status: application.outcome.status,
        onboardingStatus: application.outcome.onboardingStatus,
        notes: application.outcome.notes,
        recordedAt: application.outcome.recordedAt.toISOString(),
        recordedBy: application.outcome.recordedBy
          ? {
              name: application.outcome.recordedBy.name,
              email: application.outcome.recordedBy.email,
            }
          : null,
      }
    : null;
  const myFeedback = application.recommendationFeedback.find(
    (f) => f.authorId === ctxUserId
  );
  const signalBreakdown = dec?.signalBreakdown as
    | {
        talentWeight?: number;
        interviewWeight?: number;
        assessmentWeight?: number;
        talentScore?: number;
        interviewScore?: number;
        assessmentScore?: number;
      }
    | null
    | undefined;

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-6">
        <Link
          href={`/candidates/${candidateId}`}
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {candidate.name}
        </Link>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={candidate.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StageBadge stage={application.stage} />
              <span className="inline-flex items-center gap-1 rounded-md bg-brand/8 px-2 py-0.5 text-sm font-medium text-brand">
                <Briefcase className="h-3.5 w-3.5" />
                {application.job.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
            {candidate.email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              {phase === "talent_screening"
                ? `Screening for ${application.job.title}. Add an interview to produce hire confidence for this campaign.`
                : `Full intelligence for ${application.job.title} — talent, interview, and advisory decision.`}
            </p>
            {!readOnly && (
              <div className="mt-4">
                <CandidateBriefExportButton
                  candidateId={candidateId}
                  applicationId={applicationId}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <PageBody>
        <IntelligencePhasePanel
          phase={phase}
          jobTitle={application.job.title}
          explanation={dec?.explanation}
          recommendation={dec?.recommendation}
          hireConfidence={dec?.hireConfidence}
          roleFitScore={tp?.roleFitScore}
          signalBreakdown={signalBreakdown}
        />

        {phase === "ready_for_decision" && riskFactors.length > 0 && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Items to discuss</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalList signals={riskFactors} />
              </CardContent>
            </Card>
          </section>
        )}

        {phase === "ready_for_decision" && dec?.hireConfidence != null && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Predictive hiring success
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    P3-004
                  </span>
                </CardTitle>
                <CardDescription>
                  Likelihood this candidate succeeds in role, calibrated from your past hiring
                  outcomes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SuccessPredictionPanel applicationId={application.id} />
              </CardContent>
            </Card>
          </section>
        )}

        {!readOnly && phase === "ready_for_decision" && dec?.recommendation && (
          <section className="mb-8">
            <RecommendationFeedbackPanel
              applicationId={application.id}
              recommendation={dec.recommendation}
              myRating={myFeedback?.rating ?? null}
              myComment={myFeedback?.comment ?? null}
              counts={{
                up: application.recommendationFeedback.filter((f) => f.rating === "UP").length,
                down: application.recommendationFeedback.filter((f) => f.rating === "DOWN").length,
              }}
            />
          </section>
        )}

        {!readOnly && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Hiring outcome</CardTitle>
                <CardDescription>
                  Record what actually happened. Outcomes train the scoring model and
                  improve future hire confidence.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OutcomePanel applicationId={application.id} initialOutcome={outcome} />
              </CardContent>
            </Card>
          </section>
        )}

        <section className="mb-8">
          <div className="mb-3">
            <LayerBadge layer="assessment" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Skills assessment</CardTitle>
              <CardDescription>
                Submit and evaluate real-world task responses — scores feed hire confidence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!readOnly ? (
                <ApplicationAssessmentPanel applicationId={application.id} />
              ) : (
                <p className="text-sm text-muted">Read-only workspace — assessments not editable.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <LayerBadge layer="talent" />
              {!readOnly && <ReanalyzeButton applicationId={application.id} />}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Talent profile</CardTitle>
                <CardDescription>
                  Pre-interview signals vs {application.job.title}
                </CardDescription>
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
                  {interviewerQuality && (
                    <InterviewerQualityPanel quality={interviewerQuality} />
                  )}
                  {audioSignals && <AudioSignalsPanel audio={audioSignals} />}
                  {videoBehavioral && <VideoBehavioralPanel metrics={videoBehavioral} />}
                  {ia.explanation && (
                    <p className="text-xs italic text-muted">{ia.explanation}</p>
                  )}
                </CardContent>
              </Card>
            ) : readOnly ? (
              <Card>
                <CardHeader>
                  <CardTitle>Interview not recorded</CardTitle>
                  <CardDescription>
                    Platform operators can view customer hiring data but cannot submit
                    interviews from the workspace.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Record interview</CardTitle>
                  <CardDescription>
                    Paste a transcript for {application.job.title} to combine with resume
                    screening and unlock hire confidence.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterviewWorkflowPanel
                    applicationId={application.id}
                    jobId={application.jobId}
                    jobTitle={application.job.title}
                    interviews={application.interviews.map((i) => ({
                      id: i.id,
                      title: i.title,
                      status: i.status,
                      scheduledAt: i.scheduledAt?.toISOString() ?? null,
                      meetingUrl: i.meetingUrl,
                      recordingPath: i.recordingPath,
                      transcript: i.transcript,
                      audioSignals: parseAudioSignals(i.audioSignals),
                      videoBehavioralMetrics: parseVideoBehavioralMetrics(i.videoBehavioralMetrics),
                    }))}
                  />
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </PageBody>
    </>
  );
}
