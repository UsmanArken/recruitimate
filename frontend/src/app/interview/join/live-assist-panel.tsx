"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api-fetch";

type Segment = {
  speaker: "candidate" | "recruiter";
  text: string;
  timestampMs: number;
};

interface Props {
  interviewId: string;
  applicationId: string;
}

export function LiveAssistPanel({ interviewId, applicationId }: Props) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTranscript = useCallback(async () => {
    if (!interviewId || !applicationId) return;
    try {
      const data = await apiFetch<{ segments: Segment[] }>(
        `/api/applications/${applicationId}/interviews/${interviewId}/transcript-live`,
      );
      setSegments(data.segments ?? []);
    } catch {
      // silently ignore — interview may not have started yet
    }
  }, [interviewId, applicationId]);

  useEffect(() => {
    if (!interviewId || !applicationId) return;
    fetchTranscript();
    pollRef.current = setInterval(fetchTranscript, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchTranscript, interviewId, applicationId]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [segments]);

  async function getSuggestions() {
    if (!interviewId || !applicationId) return;
    setSuggesting(true);
    setSuggestError(null);
    try {
      const data = await apiFetch<{ followUpQuestions: string[] }>(
        `/api/applications/${applicationId}/interviews/${interviewId}/suggest`,
        { method: "POST" },
      );
      setSuggestions(data.followUpQuestions ?? []);
    } catch (e) {
      setSuggestError(e instanceof ApiError ? e.message : "Could not get suggestions");
    } finally {
      setSuggesting(false);
    }
  }

  if (!interviewId || !applicationId) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No interview session active.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-l border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live Transcript</p>
      </div>

      {/* Transcript feed */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {segments.length === 0 ? (
          <p className="text-xs text-gray-500">Waiting for speech…</p>
        ) : (
          segments.map((seg, i) => (
            <div key={i} className={`flex gap-2 ${seg.speaker === "recruiter" ? "justify-end" : ""}`}>
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  seg.speaker === "candidate"
                    ? "bg-gray-800 text-gray-100"
                    : "bg-blue-900/60 text-blue-100"
                }`}
              >
                <span className="mb-0.5 block text-xs font-semibold capitalize opacity-60">
                  {seg.speaker}
                </span>
                {seg.text}
              </div>
            </div>
          ))
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Suggest button + suggestions */}
      <div className="border-t border-gray-800 p-4 space-y-3">
        <Button
          type="button"
          disabled={suggesting || segments.length === 0}
          onClick={getSuggestions}
          className="w-full gap-2"
        >
          {suggesting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Sparkles className="h-4 w-4" />}
          {suggesting ? "Thinking…" : "Suggest follow-up"}
        </Button>

        {suggestError && (
          <p className="text-xs text-red-400">{suggestError}</p>
        )}

        {suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((q, i) => (
              <li
                key={i}
                className="rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs text-gray-200 leading-relaxed"
              >
                {q}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
