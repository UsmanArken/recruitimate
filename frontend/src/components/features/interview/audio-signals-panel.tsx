import type { AudioSignalResult } from "@/lib/intelligence/types";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { AudioLines } from "lucide-react";

export function parseAudioSignals(value: unknown): AudioSignalResult | null {
  if (!value || typeof value !== "object") return null;
  const a = value as AudioSignalResult;
  if (typeof a.pauseCount !== "number" || typeof a.pauseDensityScore !== "number") return null;
  return a;
}

export function AudioSignalsPanel({ audio }: { audio: AudioSignalResult }) {
  return (
    <section className="rounded-lg border border-interview/25 bg-interview-bg/15 p-4">
      <h4 className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
        <AudioLines className="h-4 w-4 text-interview" />
        Audio signals
        <span className="rounded-full bg-interview/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-interview">
          Phase 2
        </span>
        <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted ring-1 ring-border">
          {audio.source === "wav_pcm" ? "PCM analysis" : "Transcript fallback"}
        </span>
      </h4>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <ScoreBadge
          label="Pause density"
          score={audio.pauseDensityScore}
          invertBar
          emptyLabel="—"
        />
        <ScoreBadge label="Energy variability" score={audio.energyVariabilityScore} />
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pauses</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{audio.pauseCount}</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Longest pause</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {audio.longestPauseSec > 0 ? `${audio.longestPauseSec}s` : "—"}
          </p>
        </div>
      </div>

      {audio.pauses.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold">Detected pauses</p>
          <ul className="space-y-1.5 text-sm">
            {audio.pauses.map((p, i) => (
              <li
                key={`${p.startSec}-${i}`}
                className="rounded-md border border-border-subtle bg-card px-3 py-2"
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-muted">
                  {" "}
                  — {p.startSec}s–{p.endSec}s ({p.durationSec}s)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audio.toneShifts.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold">Tone / energy shifts</p>
          <ul className="space-y-1.5 text-sm">
            {audio.toneShifts.map((t, i) => (
              <li
                key={`${t.atSec}-${i}`}
                className="rounded-md border border-border-subtle bg-card px-3 py-2"
              >
                <span className="font-medium">
                  {t.fromLevel} → {t.toLevel}
                </span>
                <span className="text-muted"> at ~{t.atSec}s</span>
                <p className="mt-0.5 text-xs text-muted">{t.evidence}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {audio.signals.length > 0 && <SignalList signals={audio.signals} />}

      {audio.explanation && (
        <p className="mt-3 text-xs italic text-muted">{audio.explanation}</p>
      )}
    </section>
  );
}
