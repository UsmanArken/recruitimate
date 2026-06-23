"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function JobDetailActions({ jobId, canEdit }: { jobId: string; canEdit: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canEdit) return null;

  async function remove() {
    if (!window.confirm("Delete this role and all applicants in its pipeline?")) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Delete failed");
      return;
    }
    router.push("/jobs");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ButtonLink href={`/jobs/${jobId}/edit`} variant="secondary">
        <Pencil className="h-4 w-4" />
        Edit role
      </ButtonLink>
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={() => void remove()}
        className="border-risk/30 text-risk hover:bg-risk-bg"
      >
        <Trash2 className="h-4 w-4" />
        {loading ? "Deleting…" : "Delete role"}
      </Button>
      {error && <p className="w-full text-sm text-risk">{error}</p>}
    </div>
  );
}
