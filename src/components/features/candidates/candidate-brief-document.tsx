"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import {
  formatPercent,
  formatRecommendation,
  type CandidateBrief,
} from "@/lib/intelligence/brief/candidate-brief";

export function CandidateBriefDocument({
  brief,
  autoPrint = false,
}: {
  brief: CandidateBrief;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => window.print(), 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  return (
    <div className="min-h-screen bg-white text-foreground print:bg-white">
      <div className="mx-auto max-w-3xl px-8 py-10 print:px-0 print:py-0">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 print:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Hire committee brief · P2-024
            </p>
            <h1 className="mt-1 text-2xl font-bold">{brief.candidateName}</h1>
            <p className="text-sm text-muted">{brief.jobTitle}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        <article className="space-y-6 text-sm leading-relaxed">
          <header className="border-b border-border pb-4">
            <p className="text-xs uppercase tracking-widest text-muted">Recruitimate advisory brief</p>
            <h1 className="mt-2 text-3xl font-bold">{brief.candidateName}</h1>
            <p className="mt-1 text-base text-muted">{brief.jobTitle}</p>
            <p className="mt-2 text-xs text-muted">
              Stage: {brief.stageLabel} · Generated {new Date(brief.generatedAt).toLocaleString()}
            </p>
            {brief.candidateEmail && (
              <p className="text-xs text-muted">{brief.candidateEmail}</p>
            )}
          </header>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Summary scores</h2>
            <dl className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-muted">Role fit</dt>
                <dd className="text-lg font-bold">{formatPercent(brief.roleFitScore)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Hire confidence</dt>
                <dd className="text-lg font-bold">{formatPercent(brief.hireConfidence)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Recommendation</dt>
                <dd className="text-lg font-bold capitalize">
                  {formatRecommendation(brief.recommendation)}
                </dd>
              </div>
            </dl>
          </section>

          {brief.talentSummary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Talent screening</h2>
              <p className="mt-2 whitespace-pre-wrap">{brief.talentSummary}</p>
            </section>
          )}

          {(brief.strengths.length > 0 || brief.gaps.length > 0) && (
            <section className="grid gap-4 sm:grid-cols-2">
              {brief.strengths.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Strengths</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {brief.strengths.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {brief.gaps.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Gaps</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {brief.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {brief.interviewSummary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
                Interview · {brief.interviewTitle ?? "Latest"}
              </h2>
              <p className="mt-2 whitespace-pre-wrap">{brief.interviewSummary}</p>
              <p className="mt-2 text-xs text-muted">
                Confidence {formatPercent(brief.interviewScores.confidence)} · Clarity{" "}
                {formatPercent(brief.interviewScores.clarity)} · Consistency{" "}
                {formatPercent(brief.interviewScores.consistency)}
              </p>
            </section>
          )}

          {brief.riskFactors.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Risk factors</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {brief.riskFactors.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {brief.decisionExplanation && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Decision rationale</h2>
              <p className="mt-2 whitespace-pre-wrap">{brief.decisionExplanation}</p>
            </section>
          )}

          {brief.signalBreakdown && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Signal blend</h2>
              <p className="mt-2 text-xs text-muted">
                Talent {Math.round((brief.signalBreakdown.talentWeight ?? 0) * 100)}% · Interview{" "}
                {Math.round((brief.signalBreakdown.interviewWeight ?? 0) * 100)}% · Assessment{" "}
                {Math.round((brief.signalBreakdown.assessmentWeight ?? 0) * 100)}%
              </p>
            </section>
          )}

          <footer className="border-t border-border pt-4 text-[10px] text-muted">
            Advisory intelligence from Recruitimate — human hiring committee retains final decision.
          </footer>
        </article>
      </div>
    </div>
  );
}

export function CandidateBriefExportButton({
  candidateId,
  applicationId,
}: {
  candidateId: string;
  applicationId: string;
}) {
  const href = `/candidates/${candidateId}/applications/${applicationId}/brief?print=1`;

  return (
    <ButtonLink href={href} variant="secondary" className="text-sm">
      <FileDown className="h-4 w-4" />
      Export brief (PDF)
    </ButtonLink>
  );
}
