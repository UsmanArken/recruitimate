"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive, PauseCircle, Trash2 } from "lucide-react";

export function CandidateProfileActions({
  candidateId,
  marking,
  readOnly,
}: {
  candidateId: string;
  marking: string;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (readOnly) return null;

  async function setMarking(next: "ACTIVE" | "ARCHIVED" | "ON_HOLD") {
    setLoading(next);
    setError(null);
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ marking: next }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Update failed");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Permanently delete this candidate and all position reviews?")) return;
    setLoading("delete");
    setError(null);
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Delete failed");
      return;
    }
    router.push("/candidates");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {marking !== "ON_HOLD" && (
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => void setMarking("ON_HOLD")}
        >
          <PauseCircle className="h-4 w-4" />
          {loading === "ON_HOLD" ? "…" : "Mark on hold"}
        </Button>
      )}
      {marking !== "ARCHIVED" && (
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => void setMarking("ARCHIVED")}
        >
          <Archive className="h-4 w-4" />
          {loading === "ARCHIVED" ? "…" : "Archive"}
        </Button>
      )}
      {marking !== "ACTIVE" && (
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(loading)}
          onClick={() => void setMarking("ACTIVE")}
        >
          Restore active
        </Button>
      )}
      <Button
        type="button"
        variant="secondary"
        disabled={Boolean(loading)}
        onClick={() => void remove()}
        className="border-risk/30 text-risk hover:bg-risk-bg"
      >
        <Trash2 className="h-4 w-4" />
        {loading === "delete" ? "…" : "Delete profile"}
      </Button>
      {error && <p className="w-full text-sm text-risk">{error}</p>}
    </div>
  );
}
