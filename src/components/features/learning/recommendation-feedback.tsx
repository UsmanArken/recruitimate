"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react";

type Rating = "UP" | "DOWN";

export function RecommendationFeedbackPanel({
  applicationId,
  recommendation,
  myRating,
  myComment,
  counts,
}: {
  applicationId: string;
  recommendation: string;
  myRating: Rating | null;
  myComment: string | null;
  counts: { up: number; down: number };
}) {
  const router = useRouter();
  const [rating, setRating] = useState<Rating | null>(myRating);
  const [comment, setComment] = useState(myComment ?? "");
  const [showComment, setShowComment] = useState(false);
  const [pending, setPending] = useState<Rating | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recLabel = recommendation.replace(/_/g, " ");

  async function send(next: Rating, withComment: string) {
    setPending(next);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/decision-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: next, comment: withComment.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to save feedback");
      }
      setRating(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save feedback");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Was this recommendation right?</p>
          <p className="text-xs text-muted">
            Your thumbs on the <span className="font-medium">{recLabel}</span> call trains the
            scoring model.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => send("UP", comment)}
            disabled={pending !== null}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
              rating === "UP"
                ? "border-success/40 bg-success-bg text-success"
                : "border-border bg-card text-muted hover:text-foreground"
            )}
          >
            {pending === "UP" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
            Agree{counts.up > 0 ? ` · ${counts.up}` : ""}
          </button>
          <button
            type="button"
            onClick={() => send("DOWN", comment)}
            disabled={pending !== null}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition",
              rating === "DOWN"
                ? "border-warning/40 bg-warning-bg text-warning"
                : "border-border bg-card text-muted hover:text-foreground"
            )}
          >
            {pending === "DOWN" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsDown className="h-4 w-4" />
            )}
            Disagree{counts.down > 0 ? ` · ${counts.down}` : ""}
          </button>
        </div>
      </div>

      <div className="mt-3">
        {!showComment ? (
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setShowComment(true)}
          >
            {comment ? "Edit note" : "Add a note (optional)"}
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="Why do you agree or disagree?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {rating && (
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => send(rating, comment)}
              >
                Save note
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-warning">{error}</p>}
    </div>
  );
}
