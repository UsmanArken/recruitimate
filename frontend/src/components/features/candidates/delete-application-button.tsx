"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

export function DeleteApplicationButton({
  applicationId,
  candidateId,
  jobTitle,
}: {
  applicationId: string;
  candidateId: string;
  jobTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove this application from "${jobTitle}"? All interviews and analysis will be deleted.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/applications/${applicationId}`, { method: "DELETE" });
      router.push(`/candidates/${candidateId}`);
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete this application"
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-risk-bg hover:text-risk disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? "Deleting…" : "Delete application"}
    </button>
  );
}
