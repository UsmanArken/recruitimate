"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Mic, FileAudio, Sparkles, Upload, Download } from "lucide-react";
import {
  ScheduleDateTimeField,
  defaultScheduleDateTime,
  scheduleDateTimeToIso,
  type ScheduleDateTimeValue,
} from "@/components/features/candidates/schedule-datetime-field";
import { LiveInterviewAssistPanel } from "@/components/features/candidates/live-interview-assist-panel";

export type InterviewRow = {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  meetingUrl: string | null;
  recordingPath: string | null;
  transcript: string | null;
};

export function InterviewWorkflowPanel({
  applicationId,
  interviews,
}: {
  applicationId: string;
  interviews: InterviewRow[];
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(interviews[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduleTitle, setScheduleTitle] = useState("Technical interview");
  const [scheduleWhen, setScheduleWhen] = useState<ScheduleDateTimeValue>(defaultScheduleDateTime);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [transcript, setTranscript] = useState("");

  async function scheduleInterview() {
    const scheduledAt = scheduleDateTimeToIso(scheduleWhen);
    if (!scheduledAt) {
      setError("Pick a date and time for the interview.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/applications/${applicationId}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "schedule",
        title: scheduleTitle,
        scheduledAt,
        meetingUrl: meetingUrl || undefined,
      }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not schedule interview");
      return;
    }
    const interview = data.interview ?? data;
    if (interview?.id) setActiveId(interview.id);
    router.refresh();
  }

  async function uploadRecording(file: File) {
    if (!activeId) {
      setError("Schedule an interview first, or refresh the page.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.set("recording", file);
    const res = await fetch(
      `/api/applications/${applicationId}/interviews/${activeId}/recording`,
      { method: "POST", body: form, credentials: "same-origin" }
    );
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Upload failed");
      return;
    }
    router.refresh();
  }

  async function transcribe() {
    if (!activeId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(
      `/api/applications/${applicationId}/interviews/${activeId}/transcribe`,
      { method: "POST", credentials: "same-origin" }
    );
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Transcription failed");
      return;
    }
    if (data.transcript) setTranscript(data.transcript);
    router.refresh();
  }

  async function analyze(transcriptText: string) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/applications/${applicationId}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "analyze",
        title: scheduleTitle,
        transcript: transcriptText,
        interviewId: activeId || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Analysis failed");
      return;
    }
    router.refresh();
  }

  const active = interviews.find((i) => i.id === activeId);

  return (
    <div className="space-y-6">
      <LiveInterviewAssistPanel
        applicationId={applicationId}
        interviewId={activeId || undefined}
        onTranscriptReady={(text) => setTranscript(text)}
      />

      <section className="section-card">
        <h3 className="section-card__title mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            1
          </span>
          <Calendar className="h-4 w-4 text-primary" />
          Schedule interview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Title</span>
            <input
              className="input-hr mt-1.5"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Date & time
            </span>
            <div className="mt-1.5">
              <ScheduleDateTimeField value={scheduleWhen} onChange={setScheduleWhen} />
            </div>
          </div>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Meeting link
              <span className="ml-1 font-normal normal-case text-muted-foreground">(optional)</span>
            </span>
            <input
              className="input-hr mt-1.5"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={loading} onClick={scheduleInterview}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                Schedule interview
              </>
            )}
          </Button>
          {active?.scheduledAt && (
            <a
              href={`/api/applications/${applicationId}/interviews/${active.id}/calendar`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-card"
            >
              <Download className="h-3.5 w-3.5" />
              Download .ics invite
            </a>
          )}
        </div>
      </section>

      {interviews.length > 0 && (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Active interview
          </span>
          <select
            className="input-hr mt-1.5"
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
          >
            {interviews.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title} ({i.status})
              </option>
            ))}
          </select>
        </label>
      )}

      <section className="section-card">
        <h3 className="section-card__title mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            2
          </span>
          <FileAudio className="h-4 w-4 text-primary" />
          Upload recording
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-muted">
          Upload an audio or video file — we&apos;ll transcribe it with Whisper.
        </p>
        <label
          className={`file-input-hr ${loading || !activeId ? "pointer-events-none opacity-60" : ""}`}
        >
          <Upload className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">Choose recording file</span>
          <input
            type="file"
            accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4"
            disabled={loading || !activeId}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadRecording(file);
            }}
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" disabled={loading || !activeId} onClick={transcribe}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transcribe with Whisper"}
          </Button>
          {active?.transcript && (
            <span className="rounded-md bg-success-bg px-2.5 py-1 text-xs font-medium text-success">
              Transcript ready · {active.transcript.length.toLocaleString()} chars
            </span>
          )}
        </div>
      </section>

      <section className="section-card">
        <h3 className="section-card__title mb-4">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            3
          </span>
          <Mic className="h-4 w-4 text-primary" />
          Analyze interview signals
        </h3>
        <textarea
          className="input-hr min-h-[140px] text-sm leading-relaxed"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste transcript or transcribe from recording above…"
        />
        <Button
          type="button"
          className="mt-4"
          disabled={loading || transcript.trim().length < 50}
          onClick={() => analyze(transcript)}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run interview intelligence
            </>
          )}
        </Button>
      </section>

      {error && <p className="text-sm text-risk">{error}</p>}
    </div>
  );
}
