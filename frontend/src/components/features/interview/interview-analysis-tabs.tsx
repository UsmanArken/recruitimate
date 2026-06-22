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

interface AudioAggregate {
  paceWpm?: number | null;
  pauseFrequency?: number | null;
  fillerDensity?: number | null;
  energyLevel?: number | null;
  dominantTone?: string | null;
  emotionalVariance?: number | null;
}

interface AudioSentence {
  text?: string | null;
  speaker?: string | null;
  paceWpm?: number | null;
  energyLevel?: number | null;
  dominantTone?: string | null;
  fillerDensity?: number | null;
  hesitation?: number | null;
}

interface AudioMetrics {
  aggregate?: AudioAggregate | null;
  sentences?: AudioSentence[] | null;
  // legacy flat shape
  paceWpm?: number | null;
  pauseFrequency?: number | null;
  fillerDensity?: number | null;
  energyLevel?: number | null;
  dominantTone?: string | null;
  emotionalVariance?: number | null;
}

export interface InterviewAnalysisData {
  title: string;
  transcript: string | null;
  hesitationScore: number | null;
  confidenceScore: number | null;
  clarityScore: number | null;
  consistencyScore: number | null;
  engagementScore: number | null;
  cognitiveSignals: unknown;
  behavioralMetrics: unknown;
  riskFlags: string[] | null;
  interviewerQuality: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractAudioMetrics(behavioralMetrics: unknown): AudioMetrics | null {
  if (!behavioralMetrics || typeof behavioralMetrics !== "object") return null;
  const bm = behavioralMetrics as Record<string, unknown>;
  if (!bm.audioMetrics || typeof bm.audioMetrics !== "object") return null;
  return bm.audioMetrics as AudioMetrics;
}

function getAggregate(audio: AudioMetrics): AudioAggregate {
  if (audio.aggregate) return audio.aggregate;
  return {
    paceWpm: audio.paceWpm,
    pauseFrequency: audio.pauseFrequency,
    fillerDensity: audio.fillerDensity,
    energyLevel: audio.energyLevel,
    dominantTone: audio.dominantTone,
    emotionalVariance: audio.emotionalVariance,
  };
}

function getSentences(audio: AudioMetrics): AudioSentence[] {
  return audio.sentences ?? [];
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
  const audio = extractAudioMetrics(data.behavioralMetrics);
  const agg = audio ? getAggregate(audio) : null;
  const sentences = audio ? getSentences(audio) : [];

  const bm = data.behavioralMetrics as Record<string, unknown> | null;
  const cs = data.cognitiveSignals as Record<string, unknown> | null;
  const cognitiveItems: string[] = Array.isArray(cs?.items) ? (cs.items as string[]) : [];
  const workStyleNotes: string[] = Array.isArray(bm?.workStyleNotes) ? (bm.workStyleNotes as string[]) : [];

  const riskFlags = (data.riskFlags ?? []).map((f) => f.replace(/_/g, " "));
  const interviewerQuality = parseInterviewerQuality(data.interviewerQuality);

  const radarPoints = [
    { label: "Confidence", value: data.confidenceScore ?? 0 },
    { label: "Clarity", value: data.clarityScore ?? 0 },
    { label: "Engagement", value: data.engagementScore ?? 0 },
    { label: "Consistency", value: data.consistencyScore ?? 0 },
    { label: "Hesitation", value: data.hesitationScore ?? 0, invert: true },
  ];

  const fillerScore = agg?.fillerDensity != null
    ? Math.max(0, Math.min(100, Math.round((agg.fillerDensity / 20) * 100)))
    : null;

  return (
    <div className="space-y-6">

      {/* ── Signal radar + scores ── */}
      <div className="rounded-lg border border-border-subtle bg-card shadow-sm">
        {/* Radar centered above scores on all sizes */}
        <div className="flex justify-center border-b border-border-subtle px-4 pt-5 pb-3">
          <SignalRadar points={radarPoints} size={240} />
        </div>
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
          <ScoreBadge label="Confidence" score={data.confidenceScore} />
          <ScoreBadge label="Clarity" score={data.clarityScore} />
          <ScoreBadge label="Engagement" score={data.engagementScore} />
          <ScoreBadge label="Consistency" score={data.consistencyScore} />
          <ScoreBadge label="Hesitation" score={data.hesitationScore} invertBar />
        </div>
      </div>

      {/* ── Speech aggregate ── */}
      {agg && (
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Speech</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {agg.energyLevel != null && (
              <ScoreBadge label="Energy" score={agg.energyLevel * 100} />
            )}
            {agg.emotionalVariance != null && (
              <ScoreBadge label="Emotional range" score={agg.emotionalVariance * 100} />
            )}
            {fillerScore != null && (
              <ScoreBadge label="Filler density" score={fillerScore} invertBar />
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {agg.paceWpm != null && (
              <StatTile label="Pace" value={`${Math.round(agg.paceWpm)}`} unit="wpm" />
            )}
            {agg.pauseFrequency != null && (
              <StatTile label="Pauses" value={agg.pauseFrequency.toFixed(1)} unit="/ min" />
            )}
            {agg.dominantTone && (
              <div className="flex flex-col justify-between rounded-lg border border-border-subtle bg-background p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Tone</p>
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                  {agg.dominantTone}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Cognitive + Behavioral signals ── */}
      {(cognitiveItems.length > 0 || workStyleNotes.length > 0) && (
        <div className="space-y-3 rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          {cognitiveItems.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Cognitive signals</p>
              <ul className="space-y-1.5">
                {cognitiveItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {workStyleNotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Work style</p>
              <ul className="space-y-1.5">
                {workStyleNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-md border border-border-subtle bg-background px-3 py-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-talent/50" />
                    {note}
                  </li>
                ))}
              </ul>
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

      {/* ── Per-sentence breakdown ── */}
      {sentences.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Per sentence</p>
          {sentences.map((s, i) => {
            const isCandidate = s.speaker?.toLowerCase() === "candidate";
            const hesitationPct = s.hesitation != null ? Math.round(s.hesitation * 100) : null;
            const energyPct = s.energyLevel != null ? Math.round(s.energyLevel * 100) : null;
            return (
              <div key={i} className={cn(
                "rounded-lg border p-3",
                isCandidate ? "border-border-subtle bg-card" : "border-primary/15 bg-primary/5"
              )}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm leading-snug text-foreground/90">{s.text}</p>
                  <span className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    isCandidate ? "bg-muted/60 text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {s.speaker ?? "unknown"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {s.paceWpm != null && (
                    <Pill>{Math.round(s.paceWpm)} wpm</Pill>
                  )}
                  {energyPct != null && (
                    <Pill>energy {energyPct}%</Pill>
                  )}
                  {hesitationPct != null && (
                    <Pill warn={hesitationPct > 60}>hesitation {hesitationPct}%</Pill>
                  )}
                  {s.dominantTone && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium capitalize text-primary">
                      {s.dominantTone}
                    </span>
                  )}
                  {s.fillerDensity != null && s.fillerDensity > 0 && (
                    <Pill warn>{s.fillerDensity.toFixed(1)} fillers/100w</Pill>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Transcript ── */}
      <TranscriptDrawer transcript={data.transcript} interviewTitle={data.title} />

      {/* ── Interviewer quality (secondary / collapsible) ── */}
      {interviewerQuality && (
        <Collapsible label="Interviewer assessment">
          <InterviewerQualityPanel quality={interviewerQuality} />
        </Collapsible>
      )}

    </div>
  );
}

function StatTile({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-background p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-[10px] text-muted">{unit}</p>
    </div>
  );
}

function Pill({ children, warn }: { children: React.ReactNode; warn?: boolean }) {
  return (
    <span className={cn(
      "rounded px-1.5 py-0.5 font-medium",
      warn ? "bg-warning/10 text-warning" : "bg-border-subtle text-muted-foreground"
    )}>
      {children}
    </span>
  );
}
