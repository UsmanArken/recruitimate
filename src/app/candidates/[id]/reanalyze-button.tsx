"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      className="text-xs text-muted underline-offset-2 hover:underline disabled:opacity-50"
    >
      {loading ? "Re-running…" : "Re-run talent analysis"}
    </button>
  );
}
