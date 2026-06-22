import type { InterviewerQualityResult } from "@/lib/intelligence/types";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { ClipboardCheck } from "lucide-react";

export function parseInterviewerQuality(
  value: unknown
): InterviewerQualityResult | null {
  if (!value || typeof value !== "object") return null;
  const q = value as Record<string, unknown>;
  if (
    typeof q.coverageScore !== "number" ||
    typeof q.probingDepthScore !== "number"
  ) {
    return null;
  }
  return {
    coverageScore: q.coverageScore as number,
    probingDepthScore: q.probingDepthScore as number,
    biasAdvisory: Array.isArray(q.biasAdvisory) ? (q.biasAdvisory as string[]) : [],
    summary: typeof q.summary === "string" ? q.summary : null,
  };
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
      </h4>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ScoreBadge label="Requirement coverage" score={quality.coverageScore} />
        <ScoreBadge label="Probing depth" score={quality.probingDepthScore} />
      </div>

      {quality.biasAdvisory.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-warning">Bias advisory</p>
          <ul className="space-y-1.5">
            {quality.biasAdvisory.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {quality.summary && (
        <p className="text-xs italic text-muted">{quality.summary}</p>
      )}
    </section>
  );
}
