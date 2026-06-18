"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";

export function DeleteCandidateButton({
  candidateId,
  candidateName,
}: {
  candidateId: string;
  candidateName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
      window.location.replace("/candidates");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 rounded-lg border border-risk/30 bg-risk/5 px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-risk" />
          <span className="text-sm text-foreground">Delete {candidateName}? This cannot be undone.</span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="ml-2 rounded-md bg-risk px-3 py-1 text-xs font-semibold text-white hover:bg-risk/90 disabled:opacity-50"
          >
            {loading ? "Deleting…" : "Confirm"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="rounded-md px-2 py-1 text-xs text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-risk">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-risk hover:bg-risk/10 hover:text-risk"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
