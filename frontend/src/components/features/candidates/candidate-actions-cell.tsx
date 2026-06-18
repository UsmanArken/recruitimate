"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-fetch";

interface Props {
  applicationId: string;
  currentStage: string;
  source: "portal" | "manual";
}

export function CandidateActionsCell({ applicationId, currentStage, source }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStage(stage: string) {
    setLoading(stage);
    setError(null);
    try {
      await apiFetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {source === "portal" && (
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
          Portal
        </span>
      )}
      {currentStage !== "SHORTLISTED" && (
        <button
          onClick={() => updateStage("SHORTLISTED")}
          disabled={loading !== null}
          className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
        >
          {loading === "SHORTLISTED" ? "…" : "Shortlist"}
        </button>
      )}
      {currentStage !== "REJECTED" && (
        <button
          onClick={() => updateStage("REJECTED")}
          disabled={loading !== null}
          className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {loading === "REJECTED" ? "…" : "Reject"}
        </button>
      )}
      {error && <span className="text-xs text-risk">{error}</span>}
    </div>
  );
}
