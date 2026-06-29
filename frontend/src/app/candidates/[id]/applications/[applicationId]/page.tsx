import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthUser, serverFetch } from "@/lib/api-server";
import { ChevronLeft, Briefcase, Mail } from "lucide-react";
import { Avatar } from "@/components/features/candidates/avatar";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ReanalyzeButton } from "@/components/features/candidates/reanalyze-button";
import { TalentPoller } from "@/components/features/candidates/talent-poller";
import { InterviewSection } from "@/components/features/candidates/interview-section";
import { VerdictCard } from "@/components/features/candidates/verdict-card";
import { SkillMatchBar } from "@/components/features/candidates/skill-match-bar";
import { ApplicationTabs } from "@/components/features/candidates/application-tabs";
import { RecruiterReviewPanel } from "@/components/features/candidates/recruiter-review-panel";
import { IntelligencePhasePanel } from "@/components/features/candidates/intelligence-phase-panel";
import { DeleteApplicationButton } from "@/components/features/candidates/delete-application-button";
import type { InterviewAnalysisData } from "@/components/features/interview/interview-analysis-tabs";
import type { AnalysedInterview } from "@/components/features/candidates/interview-section";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  const { id: candidateId, applicationId } = await params;

  const [application, user] = await Promise.all([
    serverFetch<{
    id: string;
    stage: string;
    candidateId: string;
    jobId: string;
    candidate: { id: string; name: string; email: string | null };
    job: { id: string; title: string } | null;
    // Recruiter review fields
    talentReviewVerdict: string;
    talentReviewNotes: string | null;
    talentReviewedAt: string | null;
    talentReviewedBy: { id: string; name: string | null; email: string } | null;
    hireReviewVerdict: string;
    hireReviewNotes: string | null;
    hireReviewedAt: string | null;
    hireReviewedBy: { id: string; name: string | null; email: string } | null;
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
      recommendation: string | null;
      explanation: string | null;
      reasonsToHire: string[] | null;
      reasonsToReject: string[] | null;
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
      durationMinutes: number | null;
      audioUrl: string | null;
      analysis: {
        confidenceScore: number | null;
        clarityScore: number | null;
        pacingScore: number | null;
        fillerScore: number | null;
        energyLevel: number | null;
        dominantTone: string | null;
        emotionalVariance: number | null;
        truthfulnessScore: number | null;
        depthScore: number | null;
        resumeConsistencyScore: number | null;
        inconsistencies: string[] | null;
        depthNotes: string[] | null;
        workStyleNotes: string[] | null;
        riskFlags: string[] | null;
        interviewerQuality: unknown;
      } | null;
    }>;
  }>(`/api/applications/${applicationId}`).catch(() => null),
    getAuthUser(),
  ]);

  if (!application || application.candidateId !== candidateId) notFound();
  const canRunIntelligence = user.roleCode !== "HIRING_MANAGER";

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
        confidenceScore: i.analysis!.confidenceScore,
        clarityScore: i.analysis!.clarityScore,
        pacingScore: i.analysis!.pacingScore,
        fillerScore: i.analysis!.fillerScore,
        energyLevel: i.analysis!.energyLevel,
        dominantTone: i.analysis!.dominantTone,
        emotionalVariance: i.analysis!.emotionalVariance,
        truthfulnessScore: i.analysis!.truthfulnessScore,
        depthScore: i.analysis!.depthScore,
        resumeConsistencyScore: i.analysis!.resumeConsistencyScore,
        inconsistencies: i.analysis!.inconsistencies,
        depthNotes: i.analysis!.depthNotes,
        workStyleNotes: i.analysis!.workStyleNotes,
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
  const reasonsToHire = (dec?.reasonsToHire ?? []) as string[];
  const reasonsToReject = (dec?.reasonsToReject ?? []) as string[];

  // ── Talent tab ──────────────────────────────────────────────────────────────
  const talentContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayerBadge layer="talent" />
          <span className="text-xs font-medium text-muted">Recruitimate review</span>
        </div>
        {canRunIntelligence && <ReanalyzeButton applicationId={application.id} />}
      </div>

      <TalentPoller active={!tp} />

      {/* Stats row — resume fit + experience in one card */}
      <div className="rounded-xl border border-border-subtle bg-card shadow-sm [border-left-width:3px] border-l-talent">
        <div className="grid grid-cols-2 divide-x divide-border-subtle">
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Resume fit</p>
            <FitMeter score={tp?.roleFitScore ?? null} />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Experience</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
              {tp?.experienceYears != null ? (
                <>
                  {tp.experienceYears}
                  <span className="ml-1 text-base font-medium text-muted">yrs</span>
                </>
              ) : (
                <span className="text-muted">—</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Skills */}
      {tp && (
        <div className="rounded-xl border border-border-subtle bg-card p-4 shadow-sm [border-left-width:3px] border-l-talent">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted/60">Skills</p>
          {((tp.matchedSkills ?? []).length > 0 ||
            (tp.missingSkills ?? []).length > 0 ||
            (tp.extraSkills ?? []).length > 0) ? (
            <SkillMatchBar
              matched={tp.matchedSkills ?? []}
              missing={tp.missingSkills ?? []}
              extra={tp.extraSkills ?? []}
            />
          ) : (tp.skills ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(tp.skills ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-talent-bg px-2.5 py-1 text-xs font-medium text-talent"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Strengths + Gaps */}
      {((tp?.strengths ?? []).length > 0 || (tp?.gaps ?? []).length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(tp?.strengths ?? []).length > 0 && (
            <div className="rounded-xl border border-success/20 bg-success-bg/40 p-4 [border-left-width:3px] border-l-success">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-success">Strengths</p>
              <ul className="space-y-1.5">
                {(tp?.strengths ?? []).map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-foreground/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success/60" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(tp?.gaps ?? []).length > 0 && (
            <div className="rounded-xl border border-warning/20 bg-warning-bg/40 p-4 [border-left-width:3px] border-l-warning">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-warning">Gaps</p>
              <ul className="space-y-1.5">
                {(tp?.gaps ?? []).map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm text-foreground/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/60" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Hidden signals */}
      {hiddenSignals.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-card p-4 shadow-sm [border-left-width:3px] border-l-primary">
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-muted/60">Hidden signals</p>
          <ul className="space-y-1.5">
            {hiddenSignals.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI explanation */}
      {tp?.explanation && (
        <p className="rounded-xl border border-border-subtle bg-background px-4 py-3 text-sm italic leading-relaxed text-muted">
          {tp.explanation}
        </p>
      )}
    </div>
  );

  // ── Interview tab ───────────────────────────────────────────────────────────
  const interviewContent = (
    <div className="space-y-4">
      <LayerBadge layer="interview" />
      <InterviewSection
        analysedInterviews={analysedInterviews}
        applicationId={application.id}
        jobId={application.jobId}
        jobTitle={application.job?.title ?? ""}
        interviews={interviewRows}
      />
    </div>
  );

  // ── Decision tab ────────────────────────────────────────────────────────────
  const decisionContent = (
    <div className="space-y-4">
      <LayerBadge layer="decision" />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left — AI recommendation */}
        <VerdictCard
          applicationId={application.id}
          stage={application.stage}
          recommendation={dec?.recommendation ?? null}
          explanation={dec?.explanation ?? null}
          reasonsToHire={reasonsToHire}
          reasonsToReject={reasonsToReject}
          hasInterview={hasInterview}
        />
        {/* Right — recruiter hire decision */}
        <RecruiterReviewPanel
          applicationId={application.id}
          kind="hire"
          title="Recruiter hire decision"
          description="Your final pass/fail hire call — independent of AI recommendation."
          initial={{
            verdict: application.hireReviewVerdict as "PENDING" | "PASS" | "HOLD" | "FAIL",
            notes: application.hireReviewNotes,
            reviewedAt: application.hireReviewedAt,
            reviewerName: application.hireReviewedBy?.name ?? application.hireReviewedBy?.email ?? null,
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">

          {/* Back link + delete */}
          <div className="flex items-center justify-between pt-3 pb-0">
            <Link
              href={`/candidates/${candidateId}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-primary"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to {candidate.name}
            </Link>
            <DeleteApplicationButton
              applicationId={application.id}
              candidateId={candidateId}
              jobTitle={application.job?.title ?? "this role"}
            />
          </div>

          {/* Identity row */}
          <div className="flex flex-wrap items-center gap-4 pt-2.5 pb-3">
            <Avatar name={candidate.name} size="lg" />

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{candidate.name}</span>
                <StageBadge stage={application.stage} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {candidate.email && (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Mail className="h-3 w-3" />
                    {candidate.email}
                  </span>
                )}
              </div>
              {application.job?.title && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-brand/8 px-2.5 py-1 text-xs font-semibold text-brand">
                    <Briefcase className="h-3.5 w-3.5" />
                    {application.job.title}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Tabs + content ──────────────────────────────────────────────────── */}
      <ApplicationTabs
        tabs={[
          { id: "talent",    label: "Talent",    content: talentContent },
          { id: "interview", label: "Interview", content: interviewContent },
          { id: "decision",  label: "Decision",  content: decisionContent },
        ]}
        phaseBanner={
          <IntelligencePhasePanel
            jobTitle={application.job?.title}
            recommendation={dec?.recommendation}
            roleFitScore={tp?.roleFitScore}
            explanation={dec?.explanation}
            hasInterview={hasInterview}
            hireReviewVerdict={application.hireReviewVerdict}
          />
        }
      />

    </div>
  );
}

// ── Resume fit meter (talent tab) ─────────────────────────────────────────────

function FitMeter({ score }: { score: number | null }) {
  if (score == null) {
    return <p className="mt-2 text-2xl font-bold text-muted">—</p>;
  }
  const pct = Math.round(Math.min(100, Math.max(0, score)));
  const color = pct >= 70 ? "text-success" : pct >= 40 ? "text-warning" : "text-risk";
  const barColor =
    pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-risk";

  return (
    <div>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${color}`}>{pct}%</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
