"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type RecruiterVerdict = "PENDING" | "PASS" | "FAIL" | "HOLD";

export type RecruiterReviewState = {
  verdict: RecruiterVerdict;
  notes: string | null;
  reviewedAt: string | null;
  reviewerName: string | null;
};

const VERDICT_OPTIONS: { value: RecruiterVerdict; label: string; description: string }[] = [
  { value: "PASS", label: "Pass", description: "Move forward" },
  { value: "HOLD", label: "Hold", description: "Needs more review" },
  { value: "FAIL", label: "Fail", description: "Do not proceed" },
  { value: "PENDING", label: "Clear", description: "Reset verdict" },
];

function verdictBadgeClass(verdict: RecruiterVerdict) {
  switch (verdict) {
    case "PASS":
      return "bg-success-bg text-success";
    case "FAIL":
      return "bg-risk-bg text-risk";
    case "HOLD":
      return "bg-warning-bg text-warning";
    default:
      return "bg-muted/10 text-muted";
  }
}

export function RecruiterReviewPanel({
  applicationId,
  kind,
  title,
  description,
  initial,
  readOnly = false,
}: {
  applicationId: string;
  kind: "talent" | "hire";
  title: string;
  description: string;
  initial: RecruiterReviewState;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [verdict, setVerdict] = useState<RecruiterVerdict>(initial.verdict);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [reviewedAt, setReviewedAt] = useState(initial.reviewedAt);
  const [reviewerName, setReviewerName] = useState(initial.reviewerName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextVerdict: RecruiterVerdict) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}/recruiter-review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, verdict: nextVerdict, notes }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save review");
      return;
    }

    setVerdict(nextVerdict);
    const reviewedBy =
      kind === "talent" ? data.talentReviewedBy : data.hireReviewedBy;
    const reviewedAtValue =
      kind === "talent" ? data.talentReviewedAt : data.hireReviewedAt;

    setReviewedAt(reviewedAtValue ?? null);
    setReviewerName(reviewedBy?.name ?? reviewedBy?.email ?? null);
    router.refresh();
  }

  return (
    <Card className="border-brand/20 shadow-sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${verdictBadgeClass(verdict)}`}
          >
            {verdict === "PENDING" ? "Not set" : verdict.toLowerCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewedAt && reviewerName && (
          <p className="text-xs text-muted">
            Last updated by {reviewerName} · {new Date(reviewedAt).toLocaleString()}
          </p>
        )}

        {!readOnly && (
          <>
            <div className="flex flex-wrap gap-2">
              {VERDICT_OPTIONS.filter((o) => o.value !== "PENDING").map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={verdict === option.value ? "primary" : "secondary"}
                  disabled={loading}
                  onClick={() => save(option.value)}
                  title={option.description}
                >
                  {loading && verdict === option.value ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {option.label}
                </Button>
              ))}
            </div>

            <label className="block">
              <span className="text-sm font-semibold">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-hr mt-1.5 resize-y"
                placeholder="Why pass, hold, or fail?"
                disabled={readOnly}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={() => save(verdict)}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save notes
              </Button>
              {verdict !== "PENDING" && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={loading}
                  onClick={() => save("PENDING")}
                >
                  Clear verdict
                </Button>
              )}
            </div>
          </>
        )}

        {readOnly && notes && (
          <p className="rounded-lg border border-border-subtle bg-background p-3 text-sm">{notes}</p>
        )}

        {error && (
          <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
