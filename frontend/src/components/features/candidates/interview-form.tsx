"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";

export function InterviewForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("Technical interview");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiFetch(`/api/applications/${applicationId}/interviews`, {
        method: "POST",
        body: JSON.stringify({ title, transcript }),
      });
      setLoading(false);
      router.refresh();
    } catch (e) {
      setLoading(false);
      setError(e instanceof ApiError ? e.message : "Failed to analyze interview");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label>
        <span className="text-sm font-semibold">Interview title</span>
        <input
          className="input-hr mt-1.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label>
        <span className="text-sm font-semibold">Transcript</span>
        <textarea
          className="input-hr mt-1.5 min-h-[160px]"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste interview transcript…"
          required
          minLength={50}
        />
      </label>
      {error && <p className="text-sm text-risk">{error}</p>}
      <Button type="submit" disabled={loading || transcript.length < 50}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          "Analyze interview"
        )}
      </Button>
    </form>
  );
}
