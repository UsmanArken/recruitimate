"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api-fetch";

interface Props {
  candidateId: string;
  currentStatus: string;
  source: "portal" | "manual";
}

export function CandidateActionsCell({ candidateId, currentStatus, source }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    setError(null);
    try {
      await apiFetch(`/api/candidates/${candidateId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
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
      {currentStatus !== "shortlisted" && (
        <button
          onClick={() => updateStatus("shortlisted")}
          disabled={loading !== null}
          className="rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
        >
          {loading === "shortlisted" ? "…" : "Shortlist"}
        </button>
      )}
      {currentStatus !== "rejected" && (
        <button
          onClick={() => updateStatus("rejected")}
          disabled={loading !== null}
          className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {loading === "rejected" ? "…" : "Reject"}
        </button>
      )}
      {error && <span className="text-xs text-risk">{error}</span>}
    </div>
  );
}
