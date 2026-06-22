import Link from "next/link";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { ChevronLeft, Briefcase, Mail } from "lucide-react";
import { Avatar } from "@/components/features/candidates/avatar";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { ReanalyzeButton } from "@/components/features/candidates/reanalyze-button";
import { TalentPoller } from "@/components/features/candidates/talent-poller";
import { InterviewSection } from "@/components/features/candidates/interview-section";
import { VerdictCard } from "@/components/features/candidates/verdict-card";
import { SkillMatchBar } from "@/components/features/candidates/skill-match-bar";
import { ApplicationTabs } from "@/components/features/candidates/application-tabs";
import type { InterviewAnalysisData } from "@/components/features/interview/interview-analysis-tabs";
import type { AnalysedInterview } from "@/components/features/candidates/interview-section";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id: candidateId, applicationId } = await params;

  const application = await serverFetch<{
    id: string;
    stage: string;
    candidateId: string;
    jobId: string;
    candidate: { id: string; name: string; email: string | null };
    job: { id: string; title: string } | null;
    talentProfile: {
      roleFitScore: number | null;
      experienceYears: number | null;
      skills: string[] | null;
      matchedSkills: string[] | null;
      missingSkills: string[] | null;
      extraSkills: string[] | null;
      strengths: string[] | null;
      gaps: string[] | null;
      hiddenSignals: string[] | null;
      explanation: string | null;
    } | null;
    decision: {
      hireConfidence: number | null;
      recommendation: string | null;
      riskFactors: string[] | null;
      explanation: string | null;
      signalBreakdown: Record<string, unknown> | null;
    } | null;
    interviews: Array<{
      id: string;
      title: string;
      status: string;
      scheduledAt: string | null;
      meetingUrl: string | null;
      transcript: string | null;
      livekitRoomName: string | null;
      candidateJoinUrl: string | null;
      agentStatus: string | null;
      analysis: {
        hesitationScore: number | null;
        confidenceScore: number | null;
        clarityScore: number | null;
        consistencyScore: number | null;
        engagementScore: number | null;
        cognitiveSignals: unknown;
        behavioralMetrics: unknown;
        riskFlags: string[] | null;
        interviewerQuality: unknown;
      } | null;
    }>;
  }>(`/api/applications/${applicationId}`).catch(() => null);

  if (!application || application.candidateId !== candidateId) notFound();

  const candidate = application.candidate;
  const tp = application.talentProfile;
  const dec = application.decision;

  const analysedInterviews: AnalysedInterview[] = application.interviews
    .filter((i) => i.analysis != null)
    .map((i) => ({
      id: i.id,
      analysis: {
        title: i.title ?? "Interview",
        transcript: i.transcript ?? null,
        hesitationScore: i.analysis!.hesitationScore,
        confidenceScore: i.analysis!.confidenceScore,
        clarityScore: i.analysis!.clarityScore,
        consistencyScore: i.analysis!.consistencyScore,
        engagementScore: i.analysis!.engagementScore,
        cognitiveSignals: i.analysis!.cognitiveSignals,
        behavioralMetrics: i.analysis!.behavioralMetrics,
        riskFlags: i.analysis!.riskFlags,
        interviewerQuality: i.analysis!.interviewerQuality,
      } satisfies InterviewAnalysisData,
    }));

  const interviewRows = application.interviews.map((i) => ({
    id: i.id,
    title: i.title,
    status: i.status,
    scheduledAt: i.scheduledAt,
    meetingUrl: i.meetingUrl,
    transcript: i.transcript,
    livekitRoomName: i.livekitRoomName,
    candidateJoinUrl: i.candidateJoinUrl,
    agentStatus: i.agentStatus,
  }));

  const hasInterview = analysedInterviews.length > 0;
  const hiddenSignals = (tp?.hiddenSignals ?? []) as string[];
  const riskFactors = (dec?.riskFactors ?? []) as string[];

  const talentContent = (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <LayerBadge layer="talent" />
        <ReanalyzeButton applicationId={application.id} />
      </div>

      <TalentPoller active={!tp} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ScoreBadge label="Role fit" score={tp?.roleFitScore} />
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Experience</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {tp?.experienceYears != null ? `${tp.experienceYears} yrs` : "—"}
          </p>
        </div>
      </div>

      {tp && (
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Skills</p>
          {((tp.matchedSkills ?? []).length > 0 || (tp.missingSkills ?? []).length > 0 || (tp.extraSkills ?? []).length > 0) ? (
            <SkillMatchBar
              matched={tp.matchedSkills ?? []}
              missing={tp.missingSkills ?? []}
              extra={tp.extraSkills ?? []}
            />
          ) : (tp.skills ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(tp.skills ?? []).map((s) => (
                <span key={s} className="rounded-md bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground/70">
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {((tp?.strengths ?? []).length > 0 || (tp?.gaps ?? []).length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(tp?.strengths ?? []).length > 0 && (
            <div className="rounded-lg border border-success/20 bg-success-bg/40 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-success">Strengths</p>
              <ul className="space-y-1 text-sm text-foreground/90">
                {(tp?.strengths ?? []).map((s) => <li key={s}>· {s}</li>)}
              </ul>
            </div>
          )}
          {(tp?.gaps ?? []).length > 0 && (
            <div className="rounded-lg border border-warning/20 bg-warning-bg/40 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warning">Gaps</p>
              <ul className="space-y-1 text-sm text-foreground/90">
                {(tp?.gaps ?? []).map((g) => <li key={g}>· {g}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {hiddenSignals.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Signals</p>
          <ul className="space-y-1 text-sm text-foreground/90">
            {hiddenSignals.map((s) => <li key={s}>· {s}</li>)}
          </ul>
        </div>
      )}

      {tp?.explanation && (
        <p className="rounded-lg border border-border-subtle bg-background px-4 py-3 text-sm leading-relaxed text-muted italic">
          {tp.explanation}
        </p>
      )}
    </div>
  );

  const interviewContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <LayerBadge layer="interview" />
      </div>
      <InterviewSection
        analysedInterviews={analysedInterviews}
        applicationId={application.id}
        jobId={application.jobId}
        jobTitle={application.job?.title ?? ""}
        interviews={interviewRows}
      />
    </div>
  );

  const verdictPanel = (
    <VerdictCard
      applicationId={application.id}
      stage={application.stage}
      hireConfidence={dec?.hireConfidence ?? null}
      recommendation={dec?.recommendation ?? null}
      roleFitScore={tp?.roleFitScore ?? null}
      riskFactors={riskFactors}
      explanation={dec?.explanation ?? null}
      signalBreakdown={(dec?.signalBreakdown as Parameters<typeof VerdictCard>[0]["signalBreakdown"]) ?? null}
      hasInterview={hasInterview}
    />
  );

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Compact sticky header ─────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <div className="pt-3 pb-0">
            <Link
              href={`/candidates/${candidateId}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {candidate.name}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2.5 pb-3">
            <Avatar name={candidate.name} size="sm" />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">{candidate.name}</span>
              {candidate.email && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Mail className="h-3 w-3" />
                  {candidate.email}
                </span>
              )}
              <StageBadge stage={application.stage} />
              {application.job?.title && (
                <span className="inline-flex items-center gap-1 rounded-md bg-brand/8 px-2 py-0.5 text-xs font-medium text-brand">
                  <Briefcase className="h-3 w-3" />
                  {application.job.title}
                </span>
              )}
            </div>
            {(tp?.roleFitScore != null || dec?.hireConfidence != null) && (
              <div className="flex items-center gap-3">
                {tp?.roleFitScore != null && (
                  <HeaderScore label="Role fit" value={tp.roleFitScore} />
                )}
                {dec?.hireConfidence != null && (
                  <HeaderScore label="Hire confidence" value={dec.hireConfidence} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs + content ────────────────────────────────── */}
      <ApplicationTabs
        tabs={[
          { id: "talent", label: "Talent", content: talentContent },
          { id: "interview", label: "Interview", content: interviewContent },
        ]}
        rightPanel={verdictPanel}
      />

    </div>
  );
}

function HeaderScore({ label, value }: { label: string; value: number }) {
  const pct = Math.round(Math.min(100, Math.max(0, value)));
  const color = pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-risk";
  return (
    <div className="text-right">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{pct}%</p>
    </div>
  );
}
