"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Mic, Zap, Brain, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(value: number, invert?: boolean): string {
  const effective = invert ? 100 - value : value;
  if (effective >= 70) return "bg-success";
  if (effective >= 40) return "bg-warning";
  return "bg-risk";
}

function scoreTextColor(value: number, invert?: boolean): string {
  const effective = invert ? 100 - value : value;
  if (effective >= 70) return "text-success";
  if (effective >= 40) return "text-warning";
  return "text-risk";
}

function scoreBgColor(value: number, invert?: boolean): string {
  const effective = invert ? 100 - value : value;
  if (effective >= 70) return "bg-success-bg text-success";
  if (effective >= 40) return "bg-warning-bg text-warning";
  return "bg-risk-bg text-risk";
}

// ── Score bar row ─────────────────────────────────────────────────────────────

function ScoreRow({
  label,
  value,
  invert,
}: {
  label: string;
  value: number | null;
  invert?: boolean;
}) {
  const pct = value != null ? Math.round(Math.min(100, Math.max(0, value))) : null;
  const barPct = pct != null ? (invert ? 100 - pct : pct) : 0;

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted leading-tight">
        {label}
      </span>
      <div className="flex-1 h-1 overflow-hidden rounded-full bg-border-subtle">
        <div
          className={cn("h-full rounded-full transition-all duration-700", pct != null ? scoreColor(pct, invert) : "bg-border-subtle")}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <span className={cn("w-7 shrink-0 text-right text-xs font-bold tabular-nums", pct != null ? scoreTextColor(pct, invert) : "text-muted")}>
        {pct != null ? pct : "—"}
      </span>
    </div>
  );
}

// ── Score hero (large numeral + label) ───────────────────────────────────────

function ScoreHero({
  value,
  label,
  invert,
}: {
  value: number | null;
  label: string;
  invert?: boolean;
}) {
  const pct = value != null ? Math.round(Math.min(100, Math.max(0, value))) : null;
  const colorClass = pct != null ? scoreTextColor(pct, invert) : "text-muted";
  const bgClass = pct != null ? scoreBgColor(pct, invert) : "bg-border-subtle/40 text-muted";

  return (
    <div className={cn("inline-flex flex-col items-center justify-center rounded-xl px-4 py-3 min-w-[72px]", bgClass)}>
      <span className="text-2xl font-bold tabular-nums leading-none">{pct ?? "—"}</span>
      <span className={cn("mt-1 text-[9px] font-bold uppercase tracking-widest opacity-70")}>{label}</span>
    </div>
  );
}

// ── Note list ─────────────────────────────────────────────────────────────────

function NoteList({ notes, accent = "primary" }: { notes: string[]; accent?: "primary" | "talent" | "warning" }) {
  if (!notes.length) return null;
  const dotColor =
    accent === "talent" ? "bg-talent/60" :
    accent === "warning" ? "bg-warning/70" :
    "bg-primary/50";
  return (
    <ul className="space-y-2">
      {notes.map((note, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/80">
          <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotColor)} />
          {note}
        </li>
      ))}
    </ul>
  );
}

// ── Evidence section wrapper (left-border accent) ────────────────────────────

function EvidenceSection({
  icon: Icon,
  eyebrow,
  accent,
  children,
}: {
  icon: React.ElementType;
  eyebrow: string;
  accent: "interview" | "talent" | "warning";
  children: React.ReactNode;
}) {
  const borderColor =
    accent === "interview" ? "border-l-interview" :
    accent === "talent"    ? "border-l-talent" :
    "border-l-warning";
  const iconColor =
    accent === "interview" ? "text-interview" :
    accent === "talent"    ? "text-talent" :
    "text-warning";

  return (
    <div className={cn("rounded-xl border border-border-subtle bg-card shadow-sm [border-left-width:3px]", borderColor)}>
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-2.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{eyebrow}</span>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

// ── Collapsible ───────────────────────────────────────────────────────────────

function Collapsible({
  label,
  children,
  defaultOpen = false,
}: {
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
        className="flex w-full items-center justify-between py-1 text-[10px] font-bold uppercase tracking-widest text-muted/60 transition hover:text-muted"
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3">{children}</div>}
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
    { label: "Pacing", value: data.pacingScore ?? 0 },
    { label: "Filler words", value: data.fillerScore ?? 0, invert: true },
    { label: "Energy", value: data.energyLevel != null ? Math.round(data.energyLevel * 100) : 0 },
    { label: "Exp. range", value: data.emotionalVariance != null ? Math.round(data.emotionalVariance * 100) : 0 },
  ];

  return (
    <div className="space-y-4">

      {/* ── Audio signal ──────────────────────────────────────── */}
      <EvidenceSection icon={Mic} eyebrow="Audio signal" accent="interview">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Radar */}
          <div className="flex shrink-0 items-center justify-center">
            <SignalRadar points={radarPoints} size={190} />
          </div>

          {/* Score rows */}
          <div className="flex flex-1 flex-col justify-center gap-3">
            <ScoreRow label="Confidence"   value={data.confidenceScore} />
            <ScoreRow label="Clarity"      value={data.clarityScore} />
            <ScoreRow label="Pacing"       value={data.pacingScore} />
            <ScoreRow label="Filler words" value={data.fillerScore} invert />
            <ScoreRow label="Energy"       value={data.energyLevel != null ? Math.round(data.energyLevel * 100) : null} />
            <ScoreRow label="Exp. range"   value={data.emotionalVariance != null ? Math.round(data.emotionalVariance * 100) : null} />

            {/* Dominant tone pill */}
            {data.dominantTone && (
              <div className="mt-1 flex items-center gap-2 pt-3 border-t border-border-subtle">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted/60">Tone</span>
                <span className="rounded-md bg-interview-bg px-2.5 py-1 text-xs font-semibold capitalize text-interview">
                  {data.dominantTone}
                </span>
              </div>
            )}
          </div>
        </div>
      </EvidenceSection>

      {/* ── Truthfulness ──────────────────────────────────────── */}
      {(data.truthfulnessScore != null || riskFlags.length > 0) && (
        <EvidenceSection icon={Zap} eyebrow="Truthfulness" accent="interview">
          <div className="flex items-start gap-5">
            <ScoreHero value={data.truthfulnessScore} label="Score" />
            {riskFlags.length > 0 && (
              <ul className="flex-1 space-y-2 pt-1">
                {riskFlags.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-sm font-medium capitalize text-foreground/90"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </EvidenceSection>
      )}

      {/* ── Depth ─────────────────────────────────────────────── */}
      {(data.depthScore != null || depthNotes.length > 0 || workStyleNotes.length > 0) && (
        <EvidenceSection icon={Brain} eyebrow="Answer depth" accent="talent">
          <div className="space-y-4">
            {data.depthScore != null && (
              <div className="flex items-center gap-4">
                <ScoreHero value={data.depthScore} label="Depth" />
                {depthNotes.length > 0 && (
                  <div className="flex-1">
                    <NoteList notes={depthNotes} accent="talent" />
                  </div>
                )}
              </div>
            )}
            {data.depthScore == null && depthNotes.length > 0 && (
              <NoteList notes={depthNotes} accent="talent" />
            )}
            {workStyleNotes.length > 0 && (
              <div className={depthNotes.length > 0 || data.depthScore != null ? "pt-3 border-t border-border-subtle" : ""}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/60">Work style</p>
                <NoteList notes={workStyleNotes} accent="primary" />
              </div>
            )}
          </div>
        </EvidenceSection>
      )}

      {/* ── Resume consistency ────────────────────────────────── */}
      {(data.resumeConsistencyScore != null || inconsistencies.length > 0) && (
        <EvidenceSection icon={FileCheck} eyebrow="Resume consistency" accent="warning">
          <div className="space-y-4">
            {data.resumeConsistencyScore != null && (
              <div className="flex items-center gap-4">
                <ScoreHero value={data.resumeConsistencyScore} label="Score" />
                {inconsistencies.length > 0 && (
                  <div className="flex-1">
                    <NoteList notes={inconsistencies} accent="warning" />
                  </div>
                )}
              </div>
            )}
            {data.resumeConsistencyScore == null && inconsistencies.length > 0 && (
              <NoteList notes={inconsistencies} accent="warning" />
            )}
          </div>
        </EvidenceSection>
      )}

      {/* ── Transcript ────────────────────────────────────────── */}
      <TranscriptDrawer transcript={data.transcript} interviewTitle={data.title} />

      {/* ── Interviewer quality (collapsed by default) ────────── */}
      {interviewerQuality && (
        <div className="rounded-xl border border-border-subtle bg-card px-5 py-3 shadow-sm">
          <Collapsible label="Interviewer assessment">
            <InterviewerQualityPanel quality={interviewerQuality} />
          </Collapsible>
        </div>
      )}

    </div>
  );
}
