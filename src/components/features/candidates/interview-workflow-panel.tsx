"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Mic, FileAudio, Sparkles } from "lucide-react";
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

      <section className="rounded-lg border border-border-subtle p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-primary" />
          1. Schedule interview
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">Title</span>
            <input
              className="input-hr mt-1"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <span className="text-xs font-semibold">Date & time</span>
            <div className="mt-1">
              <ScheduleDateTimeField value={scheduleWhen} onChange={setScheduleWhen} />
            </div>
          </div>
          <label className="block sm:col-span-2">
            <span className="text-xs font-semibold">Meeting link (optional)</span>
            <input
              className="input-hr mt-1"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/…"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" disabled={loading} onClick={scheduleInterview}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule & send invite stub"}
          </Button>
          {active?.scheduledAt && (
            <a
              href={`/api/applications/${applicationId}/interviews/${active.id}/calendar`}
              className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-card"
            >
              Download calendar invite (.ics)
            </a>
          )}
        </div>
      </section>

      {interviews.length > 0 && (
        <label className="block text-sm">
          <span className="font-semibold">Active interview</span>
          <select
            className="input-hr mt-1"
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

      <section className="rounded-lg border border-border-subtle p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <FileAudio className="h-4 w-4 text-primary" />
          2. Upload recording → Whisper transcript
        </h3>
        <input
          type="file"
          accept="audio/*,video/*,.mp3,.wav,.m4a,.webm,.mp4"
          className="text-sm"
          disabled={loading || !activeId}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadRecording(file);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={loading || !activeId} onClick={transcribe}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transcribe with Whisper"}
          </Button>
          {active?.transcript && (
            <span className="text-xs text-muted self-center">
              Transcript ready ({active.transcript.length} chars)
            </span>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Mic className="h-4 w-4 text-primary" />
          3. Analyze interview signals
        </h3>
        <textarea
          className="input-hr min-h-[120px] text-sm"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste transcript or transcribe from recording above…"
        />
        <Button
          type="button"
          className="mt-3"
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
