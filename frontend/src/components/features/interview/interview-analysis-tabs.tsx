"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import {
  InterviewerQualityPanel,
  parseInterviewerQuality,
} from "@/components/features/interview/interviewer-quality-panel";
import { SignalRadar } from "@/components/features/candidates/signal-radar";
import { TranscriptDrawer } from "@/components/features/candidates/transcript-drawer";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InterviewAnalysisData {
  title: string;
  transcript: string | null;
  // Audio scores (Call 2)
  confidenceScore: number | null;
  clarityScore: number | null;
  pacingScore: number | null;
  fillerScore: number | null;
  energyLevel: number | null;
  dominantTone: string | null;
  emotionalVariance: number | null;
  // Transcript + cross-signal scores (Call 3)
  truthfulnessScore: number | null;
  depthScore: number | null;
  resumeConsistencyScore: number | null;
  inconsistencies: string[] | null;
  depthNotes: string[] | null;
  workStyleNotes: string[] | null;
  riskFlags: string[] | null;
  // Interviewer quality (Call 5)
  interviewerQuality: unknown;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FlagList({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  return (
    <ul className="space-y-1.5">
      {flags.map((f, i) => (
        <li key={i} className="flex items-center gap-2 rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-sm">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          <span className="capitalize text-foreground/90">{f.replace(/_/g, " ")}</span>
        </li>
      ))}
    </ul>
  );
}

function NoteList({ notes, color = "primary" }: { notes: string[]; color?: "primary" | "talent" }) {
  if (!notes.length) return null;
  return (
    <ul className="space-y-1.5">
      {notes.map((note, i) => (
        <li key={i} className="flex items-start gap-2 rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-foreground/80">
          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", color === "talent" ? "bg-talent/50" : "bg-primary/50")} />
          {note}
        </li>
      ))}
    </ul>
  );
}

function Collapsible({ label, children, defaultOpen = false }: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-xs font-bold uppercase tracking-wide text-muted transition hover:text-foreground"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function InterviewAnalysisTabs({ data }: { data: InterviewAnalysisData }) {
  const depthNotes = data.depthNotes ?? [];
  const workStyleNotes = data.workStyleNotes ?? [];
  const riskFlags = (data.riskFlags ?? []).map((f) => f.replace(/_/g, " "));
  const inconsistencies = data.inconsistencies ?? [];
  const interviewerQuality = parseInterviewerQuality(data.interviewerQuality);

  const radarPoints = [
    { label: "Confidence", value: data.confidenceScore ?? 0 },
    { label: "Clarity", value: data.clarityScore ?? 0 },
    { label: "Truthfulness", value: data.truthfulnessScore ?? 0 },
    { label: "Depth", value: data.depthScore ?? 0 },
    { label: "Pacing", value: data.pacingScore ?? 0 },
  ];

  return (
    <div className="space-y-6">

      {/* ── Signal radar + scores ── */}
      <div className="rounded-lg border border-border-subtle bg-card shadow-sm">
        <div className="flex justify-center border-b border-border-subtle px-4 pt-5 pb-3">
          <SignalRadar points={radarPoints} size={240} />
        </div>
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          <ScoreBadge label="Confidence" score={data.confidenceScore} />
          <ScoreBadge label="Clarity" score={data.clarityScore} />
          {/* energyLevel displayed as Engagement per design decision */}
          <ScoreBadge label="Engagement" score={data.energyLevel != null ? data.energyLevel * 100 : null} />
          <ScoreBadge label="Truthfulness" score={data.truthfulnessScore} />
          <ScoreBadge label="Depth" score={data.depthScore} />
          <ScoreBadge label="Pacing" score={data.pacingScore} />
          <ScoreBadge label="Filler words" score={data.fillerScore} invertBar />
          <ScoreBadge label="Resume match" score={data.resumeConsistencyScore} />
        </div>
      </div>

      {/* ── Tone + variance ── */}
      {(data.dominantTone || data.emotionalVariance != null) && (
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Voice signals</p>
          <div className="flex flex-wrap gap-3">
            {data.dominantTone && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Dominant tone</p>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                  {data.dominantTone}
                </span>
              </div>
            )}
            {data.emotionalVariance != null && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Emotional range</p>
                <span className="inline-block rounded-full bg-border-subtle px-2.5 py-1 text-xs font-semibold text-foreground/70">
                  {Math.round(data.emotionalVariance * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Inconsistencies ── */}
      {inconsistencies.length > 0 && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warning">Resume / interview gaps</p>
          <ul className="space-y-1.5">
            {inconsistencies.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Depth notes + work style ── */}
      {(depthNotes.length > 0 || workStyleNotes.length > 0) && (
        <div className="space-y-3 rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          {depthNotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Depth of understanding</p>
              <NoteList notes={depthNotes} color="primary" />
            </div>
          )}
          {workStyleNotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Work style</p>
              <NoteList notes={workStyleNotes} color="talent" />
            </div>
          )}
        </div>
      )}

      {/* ── Signal flags ── */}
      {riskFlags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warning">Signal flags</p>
          <FlagList flags={riskFlags} />
        </div>
      )}

      {/* ── Transcript ── */}
      <TranscriptDrawer
        transcript={data.transcript}
        interviewTitle={data.title}
      />

      {/* ── Interviewer quality ── */}
      {interviewerQuality && (
        <Collapsible label="Interviewer assessment">
          <InterviewerQualityPanel quality={interviewerQuality} />
        </Collapsible>
      )}

    </div>
  );
}
