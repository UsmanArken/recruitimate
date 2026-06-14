import type { InterviewerQualityResult } from "@/lib/intelligence/types";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { SignalList } from "@/components/features/intelligence/signal-list";
import { ClipboardCheck } from "lucide-react";

export function parseInterviewerQuality(
  value: unknown
): InterviewerQualityResult | null {
  if (!value || typeof value !== "object") return null;
  const q = value as InterviewerQualityResult;
  if (
    typeof q.coverageScore !== "number" ||
    typeof q.probingScore !== "number" ||
    typeof q.biasRiskScore !== "number"
  ) {
    return null;
  }
  return q;
}

export function InterviewerQualityPanel({
  quality,
}: {
  quality: InterviewerQualityResult;
}) {
  return (
    <section className="rounded-lg border border-primary/20 bg-background/40 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        Interviewer quality
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
          Phase 2
        </span>
      </h4>
      <p className="mb-3 text-xs text-muted">
        Advisory scores for question coverage, probing depth, and potential bias patterns in
        this interview.
      </p>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ScoreBadge label="Requirement coverage" score={quality.coverageScore} />
        <ScoreBadge label="Probing depth" score={quality.probingScore} />
        <ScoreBadge label="Bias risk" score={quality.biasRiskScore} invertBar />
      </div>

      {quality.coverageGaps.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold text-warning">Coverage gaps</p>
          <SignalList signals={quality.coverageGaps} />
        </div>
      )}

      {quality.probingSignals.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold">Probing observations</p>
          <SignalList signals={quality.probingSignals} />
        </div>
      )}

      {quality.biasFlags.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-sm font-semibold text-risk">Bias pattern flags</p>
          <SignalList signals={quality.biasFlags} />
        </div>
      )}

      {quality.explanation && (
        <p className="text-xs italic text-muted">{quality.explanation}</p>
      )}
    </section>
  );
}
