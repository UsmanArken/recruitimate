"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function InterviewForm({ candidateId }: { candidateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch(`/api/candidates/${candidateId}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        transcript: fd.get("transcript"),
      }),
    });

    if (!res.ok) {
      setError("Analysis failed. Check transcript length (50+ chars) and database.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="title"
        required
        placeholder="e.g. Technical round 1"
        className={inputClass}
      />
      <textarea
        name="transcript"
        required
        rows={10}
        placeholder="Paste interview transcript…"
        className={inputClass}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "Analyze interview"}
      </button>
    </form>
  );
}
