"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function ReanalyzeButton({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reanalyze() {
    setLoading(true);
    await fetch(`/api/candidates/${candidateId}/talent`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={reanalyze}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover disabled:opacity-50"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing…" : "Refresh talent profile"}
    </button>
  );
}
