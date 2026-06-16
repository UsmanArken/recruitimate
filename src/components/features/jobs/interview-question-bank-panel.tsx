"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, ListChecks, Sparkles } from "lucide-react";
import type {
  InterviewQuestion,
  InterviewQuestionBankResult,
  InterviewQuestionCategory,
} from "@/lib/intelligence/types";

const categoryLabels: Record<InterviewQuestionCategory, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  situational: "Situational",
  role_fit: "Role fit",
  culture: "Culture",
};

const categoryStyles: Record<InterviewQuestionCategory, string> = {
  technical: "bg-interview/10 text-interview",
  behavioral: "bg-talent-bg text-talent",
  situational: "bg-warning-bg text-warning",
  role_fit: "bg-brand/10 text-brand",
  culture: "bg-success-bg text-success",
};

const difficultyStyles = {
  easy: "bg-background text-muted ring-1 ring-border",
  medium: "bg-warning-bg text-warning",
  hard: "bg-risk-bg text-risk",
};

type FocusOption = InterviewQuestionCategory | "all";

export function InterviewQuestionBankPanel({
  jobId,
  jobTitle,
  compact = false,
}: {
  jobId: string;
  jobTitle: string;
  compact?: boolean;
}) {
  const [focus, setFocus] = useState<FocusOption>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bank, setBank] = useState<InterviewQuestionBankResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/interview-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ focus, count: compact ? 8 : 12 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not generate questions");
        return;
      }
      setBank(data as InterviewQuestionBankResult);
    } finally {
      setLoading(false);
    }
  }

  async function copyQuestion(question: InterviewQuestion) {
    await navigator.clipboard.writeText(question.question);
    setCopiedId(question.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section
      className={
        compact
          ? "rounded-lg border border-border-subtle bg-card/50 p-4"
          : "rounded-lg border-2 border-primary/20 bg-card p-4"
      }
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <ListChecks className="h-4 w-4 text-primary" />
            Interview question bank
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Phase 2
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            AI-generated, role-specific questions for {jobTitle}. Pick what fits your interview
            style.
          </p>
        </div>
        <Button
          type="button"
          className="h-8 px-3 text-xs"
          disabled={loading}
          onClick={generate}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate questions
            </>
          )}
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted">Focus:</span>
        {(["all", "technical", "behavioral", "situational", "role_fit", "culture"] as FocusOption[]).map(
          (option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFocus(option)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${
                focus === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted ring-1 ring-border hover:text-foreground"
              }`}
            >
              {option === "all" ? "All" : categoryLabels[option]}
            </button>
          )
        )}
      </div>

      {bank && (
        <div className="space-y-3">
          <p className="rounded-lg border border-border-subtle bg-background/60 px-3 py-2 text-sm">
            <span className="font-semibold">Role focus: </span>
            {bank.roleSummary}
          </p>

          <ul className="space-y-2">
            {bank.questions.map((q) => (
              <li
                key={q.id}
                className="rounded-lg border border-border-subtle bg-card p-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryStyles[q.category]}`}
                    >
                      {categoryLabels[q.category]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${difficultyStyles[q.difficulty]}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyQuestion(q)}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedId === q.id ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed">{q.question}</p>
                <p className="mt-1 text-xs text-muted">{q.rationale}</p>
                <p className="mt-1 text-xs text-muted">
                  <span className="font-medium">Probes for: </span>
                  {q.probesFor}
                </p>
              </li>
            ))}
          </ul>

          {bank.explanation && (
            <p className="text-xs italic text-muted">{bank.explanation}</p>
          )}
        </div>
      )}

      {!bank && !loading && (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Click Generate to build a question bank from this role&apos;s description and requirements.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-risk">{error}</p>}
    </section>
  );
}
