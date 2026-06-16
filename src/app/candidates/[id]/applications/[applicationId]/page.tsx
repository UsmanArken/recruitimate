import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { getApplicationById } from "@/lib/services/application.service";
import { getIntelligencePhase } from "@/lib/intelligence/candidate-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { IntelligencePhasePanel } from "@/components/features/candidates/intelligence-phase-panel";
import { ApplicationDetailTabs } from "@/components/features/candidates/application-detail-tabs";
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
import { ReanalyzeButton } from "@/components/features/candidates/reanalyze-button";
import { PageBody } from "@/components/layout/page-header";
import type { Signal } from "@/lib/intelligence/types";
import { Briefcase, ChevronLeft, Mail, Mic2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id: candidateId, applicationId } = await params;

  let application: Awaited<ReturnType<typeof getApplicationById>> | null = null;
  let readOnly = false;

  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
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

  const talentCard = (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <LayerBadge layer="talent" />
        {!readOnly && <ReanalyzeButton applicationId={application.id} />}
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Talent profile</CardTitle>
          <CardDescription>Pre-interview signals vs {application.job.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
            <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Experience</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
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
              <p className="mb-2 text-sm font-semibold text-warning">Gaps to probe in interview</p>
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
            <p className="rounded-lg border border-border-subtle bg-background p-4 text-sm leading-relaxed italic text-muted">
              {tp.explanation}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );

  const interviewPanel = ia ? (
    <section className="space-y-6">
      <div className="mb-3">
        <LayerBadge layer="interview" />
      </div>
      <Card className="shadow-sm">
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
          {interviewerQuality && <InterviewerQualityPanel quality={interviewerQuality} />}
          {audioSignals && <AudioSignalsPanel audio={audioSignals} />}
          {videoBehavioral && <VideoBehavioralPanel metrics={videoBehavioral} />}
          {ia.explanation && (
            <p className="text-sm italic leading-relaxed text-muted">{ia.explanation}</p>
          )}
        </CardContent>
      </Card>
    </section>
  ) : readOnly ? (
    <Card>
      <CardHeader>
        <CardTitle>Interview not recorded</CardTitle>
        <CardDescription>Read-only workspace — interviews cannot be submitted here.</CardDescription>
      </CardHeader>
    </Card>
  ) : (
    <Card className="border-interview/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-interview" />
          Interview workspace
        </CardTitle>
        <CardDescription>
          Use live assist during the call, then paste or transcribe a transcript to unlock hire
          confidence.
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
  );

  const decisionPanel =
    phase === "ready_for_decision" ? (
      <div className="space-y-6">
        {riskFactors.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Items to discuss</CardTitle>
              <CardDescription>Topics for your hiring committee</CardDescription>
            </CardHeader>
            <CardContent>
              <SignalList signals={riskFactors} />
            </CardContent>
          </Card>
        )}
        <Card className="border-decision/20 shadow-sm">
          <CardHeader>
            <CardTitle>Advisory summary</CardTitle>
            <CardDescription>
              Combined talent + interview signals for {application.job.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreBadge label="Hire confidence" score={dec?.hireConfidence} />
              <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
            </div>
            {dec?.explanation && (
              <p className="rounded-lg border border-border-subtle bg-background p-4 text-sm leading-relaxed">
                {dec.explanation}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    ) : (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center">
          <p className="font-semibold text-foreground">Decision not ready yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Complete an interview in the <span className="font-medium">Interview</span> tab to
            unlock hire confidence and committee recommendations.
          </p>
        </CardContent>
      </Card>
    );

  return (
    <>
      <div className="border-b border-border bg-card/90 px-8 py-6 backdrop-blur-sm">
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
              <span className="inline-flex items-center gap-1 rounded-md bg-brand/8 px-2.5 py-0.5 text-sm font-medium text-brand">
                <Briefcase className="h-3.5 w-3.5" />
                {application.job.title}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{candidate.name}</h1>
            {candidate.email && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </p>
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
        />

        <ApplicationDetailTabs
          phase={phase}
          screen={talentCard}
          interview={interviewPanel}
          decision={decisionPanel}
        />
      </PageBody>
    </>
  );
}
