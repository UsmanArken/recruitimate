"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Loader2,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import type { LiveAssistResult, LiveAssistSuggestion } from "@/lib/intelligence/types";
import {
  CrossSignalSummaryBanner,
  InconsistencyFlagsList,
  MismatchAlertsList,
} from "@/components/features/candidates/mismatch-alerts-list";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const priorityStyles: Record<LiveAssistSuggestion["priority"], string> = {
  high: "bg-risk-bg text-risk",
  medium: "bg-warning-bg text-warning",
  low: "bg-background text-muted ring-1 ring-border",
};

const categoryLabels: Record<LiveAssistSuggestion["category"], string> = {
  probe: "Probe gap",
  clarify: "Clarify",
  deepen: "Go deeper",
};

export function LiveInterviewAssistPanel({
  applicationId,
  interviewId,
  onTranscriptReady,
}: {
  applicationId: string;
  interviewId?: string;
  onTranscriptReady?: (transcript: string) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assist, setAssist] = useState<LiveAssistResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastFetchedLengthRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognition()));
  }, []);

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (text.trim().length < 30) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/applications/${applicationId}/live-assist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            transcript: text,
            interviewId,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not load suggestions");
          return;
        }
        setAssist(data as LiveAssistResult);
        lastFetchedLengthRef.current = text.length;
      } finally {
        setLoading(false);
      }
    },
    [applicationId, interviewId]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const growth = transcript.length - lastFetchedLengthRef.current;
    if (!listening || transcript.trim().length < 80 || growth < 40) return;

    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(transcript);
    }, 4000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [transcript, listening, fetchSuggestions]);

  function startListening() {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Live speech capture needs Chrome or Edge. Type or paste transcript instead.");
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let chunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        chunk += event.results[i][0].transcript;
        if (event.results[i].isFinal) chunk += " ";
      }
      if (chunk.trim()) {
        setTranscript((prev) => {
          const next = prev ? `${prev.trimEnd()} ${chunk.trim()}` : chunk.trim();
          onTranscriptReady?.(next);
          return next;
        });
      }
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Speech capture stopped — check microphone permissions or type manually.");
    };

    recognition.onend = () => {
      if (listening) {
        try {
          recognition.start();
        } catch {
          setListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setError(null);
  }

  function stopListening() {
    setListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  async function copyQuestion(suggestion: LiveAssistSuggestion) {
    await navigator.clipboard.writeText(suggestion.question);
    setCopiedId(suggestion.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <section className="rounded-lg border-2 border-interview/30 bg-interview-bg/20 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Radio className="h-4 w-4 text-interview" />
            Live interview assist
            <span className="rounded-full bg-interview/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-interview">
              Phase 2
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            Real-time follow-up questions, resume cross-checks, and inconsistency flags while
            the interview is in progress. Advisory only — you decide what to ask.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!listening ? (
            <Button type="button" variant="secondary" className="h-8 px-3 text-xs" onClick={startListening}>
              <Mic className="h-4 w-4" />
              Start listening
            </Button>
          ) : (
            <Button type="button" className="h-8 px-3 text-xs" onClick={stopListening}>
              <MicOff className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Button
            type="button"
            className="h-8 px-3 text-xs"
            disabled={loading || transcript.trim().length < 30}
            onClick={() => fetchSuggestions(transcript)}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Refresh suggestions
              </>
            )}
          </Button>
        </div>
      </div>

      {!speechSupported && (
        <p className="mb-3 flex items-start gap-2 rounded-lg bg-warning-bg/60 px-3 py-2 text-xs text-warning">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Browser speech capture unavailable — paste or type the live transcript below.
        </p>
      )}

      {listening && (
        <p className="mb-3 flex items-center gap-2 text-xs font-medium text-interview">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-interview opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-interview" />
          </span>
          Listening — suggestions and cross-signal alerts refresh as the conversation grows.
        </p>
      )}

      <label className="block text-sm">
        <span className="text-xs font-semibold">Live transcript</span>
        <textarea
          className="input-hr mt-1 min-h-[100px] text-sm"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscriptReady?.(e.target.value);
          }}
          placeholder="Speech appears here, or paste/type notes during the interview…"
        />
      </label>

      {assist && (
        <div className="mt-4 space-y-4">
          <p className="rounded-lg border border-border-subtle bg-card px-3 py-2 text-sm text-foreground/90">
            <span className="font-semibold">Right now: </span>
            {assist.momentSummary}
          </p>

          <CrossSignalSummaryBanner summary={assist.crossSignalSummary} />

          {(assist.mismatchAlerts.length > 0 || assist.inconsistencyFlags.length > 0) && (
            <div className="space-y-4 rounded-lg border border-warning/25 bg-card/50 p-3">
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-warning">
                  Resume vs interview mismatches
                </h4>
                <MismatchAlertsList alerts={assist.mismatchAlerts} />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-risk">
                  Live inconsistency flags
                </h4>
                <InconsistencyFlagsList flags={assist.inconsistencyFlags} />
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-interview">
              Suggested follow-up questions
            </h4>
            <ul className="space-y-2">
            {assist.suggestions.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-border-subtle bg-card p-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-interview/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-interview">
                      {categoryLabels[s.category]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityStyles[s.priority]}`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-7 px-2 text-xs"
                    onClick={() => copyQuestion(s)}
                  >
                    <Copy className="h-3 w-3" />
                    {copiedId === s.id ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="mt-2 text-sm font-medium leading-relaxed">{s.question}</p>
                <p className="mt-1 text-xs text-muted">{s.rationale}</p>
              </li>
            ))}
            </ul>
          </div>

          {assist.explanation && (
            <p className="text-xs italic text-muted">{assist.explanation}</p>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-risk">{error}</p>}
    </section>
  );
}
