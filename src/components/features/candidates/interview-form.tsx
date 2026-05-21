"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      setError("Analysis failed. Ensure transcript is at least 50 characters.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Interview round</span>
        <input
          name="title"
          required
          placeholder="e.g. Hiring manager screen"
          className="input-hr mt-1.5"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Transcript</span>
        <textarea
          name="transcript"
          required
          rows={10}
          placeholder="Paste the full interview transcript…"
          className="input-hr mt-1.5"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Generating report…" : "Analyze interview"}
      </Button>
    </form>
  );
}
