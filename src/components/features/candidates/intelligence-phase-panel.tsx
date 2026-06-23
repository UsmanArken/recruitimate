import { Mic2, Sparkles } from "lucide-react";
import type { IntelligencePhase } from "@/lib/intelligence/candidate-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationBadge } from "@/components/features/intelligence/recommendation-badge";
import { ScoreBadge } from "@/components/features/intelligence/score-badge";
import { TrustBanner } from "@/components/features/intelligence/trust-banner";

export function IntelligencePhasePanel({
  phase,
  jobTitle,
  explanation,
  recommendation,
  hireConfidence,
  roleFitScore,
  signalBreakdown,
}: {
  phase: IntelligencePhase;
  jobTitle?: string | null;
  explanation?: string | null;
  recommendation?: string | null;
  hireConfidence?: number | null;
  roleFitScore?: number | null;
  signalBreakdown?: {
    talentWeight?: number;
    interviewWeight?: number;
    assessmentWeight?: number;
    talentScore?: number;
    interviewScore?: number;
    assessmentScore?: number;
  } | null;
}) {
  if (phase === "talent_screening") {
    return (
      <section className="mb-8">
        <Card className="overflow-hidden border-interview/25">
          <div className="bg-interview-bg px-6 py-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-interview">
              <Sparkles className="h-3.5 w-3.5" />
              Preliminary screening — {jobTitle}
            </p>
          </div>
          <CardHeader>
            <CardDescription>
              Resume matched to this requisition. A hire recommendation is advisory-only and
              requires interview intelligence — we do not guess a final decision from a CV alone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <ScoreBadge label="Role fit (resume)" score={roleFitScore} />
              <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Committee recommendation
                </p>
                <div className="mt-2">
                  <RecommendationBadge value={recommendation ?? "pending_interview"} />
                </div>
              </div>
            </div>
            {explanation && (
              <p className="rounded-lg border border-border-subtle bg-background p-4 text-sm leading-relaxed">
                {explanation}
              </p>
            )}
            <p className="flex items-center gap-2 text-sm font-medium text-interview">
              <Mic2 className="h-4 w-4" />
              Next step: record an interview below to unlock hire confidence.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <Card className="overflow-hidden border-decision/30">
        <div className="bg-decision-bg px-6 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-decision">
            Hiring recommendation — {jobTitle}
          </p>
        </div>
        <CardHeader>
          <CardDescription>
            Advisory summary for your hiring committee — talent + interview signals for this
            open position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TrustBanner>
            This recommendation assists your decision; it does not replace recruiter judgment
            or compliance review.
          </TrustBanner>
          <div className="grid gap-4 sm:grid-cols-3">
            <ScoreBadge label="Hire confidence" score={hireConfidence} />
            <div className="rounded-lg border border-border-subtle bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Recommendation
              </p>
              <div className="mt-2">
                <RecommendationBadge value={recommendation} />
              </div>
            </div>
            <ScoreBadge label="Role fit" score={roleFitScore} />
          </div>
          {explanation && (
            <div className="rounded-lg border border-border-subtle bg-background p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-muted">Summary</p>
              <p className="text-sm leading-relaxed">{explanation}</p>
            </div>
          )}
          {signalBreakdown && (signalBreakdown.assessmentWeight ?? 0) > 0 && (
            <div className="rounded-lg border border-amber-200/50 bg-amber-500/5 p-4 text-xs text-muted">
              Signal blend: talent {Math.round((signalBreakdown.talentWeight ?? 0) * 100)}% ·
              interview {Math.round((signalBreakdown.interviewWeight ?? 0) * 100)}% · assessment{" "}
              {Math.round((signalBreakdown.assessmentWeight ?? 0) * 100)}%
              {signalBreakdown.assessmentScore != null && (
                <> (score {Math.round(signalBreakdown.assessmentScore * 100)}%)</>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
