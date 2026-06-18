"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Mic, Sparkles, Download } from "lucide-react";
import {
  ScheduleDateTimeField,
  defaultScheduleDateTime,
  scheduleDateTimeToIso,
  type ScheduleDateTimeValue,
} from "@/components/features/candidates/schedule-datetime-field";
import { LiveInterviewAssistPanel } from "@/components/features/candidates/live-interview-assist-panel";
import { InterviewQuestionBankPanel } from "@/components/features/jobs/interview-question-bank-panel";
import { apiFetch, ApiError } from "@/lib/api-fetch";

export type InterviewRow = {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  meetingUrl: string | null;
  transcript: string | null;
};

export function InterviewWorkflowPanel({
  applicationId,
  jobId,
  jobTitle,
  interviews,
}: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
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
    try {
      const data = await apiFetch<{ interview?: { id: string }; id?: string }>(
        `/api/applications/${applicationId}/interviews`,
        {
          method: "POST",
          body: JSON.stringify({
            title: scheduleTitle,
            scheduledAt,
            meetingUrl: meetingUrl || undefined,
          }),
        }
      );
      setLoading(false);
      const interview = data.interview ?? data;
      if (interview?.id) setActiveId(interview.id);
      router.refresh();
    } catch (e) {
      setLoading(false);
      setError(e instanceof ApiError ? e.message : "Could not schedule interview");
    }
  }

  async function analyze(transcriptText: string) {
    if (!activeId) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/applications/${applicationId}/interviews/${activeId}/analyze`, {
        method: "POST",
      });
      setLoading(false);
      router.refresh();
    } catch (e) {
      setLoading(false);
      setError(e instanceof ApiError ? e.message : "Analysis failed");
    }
  }

  const active = interviews.find((i) => i.id === activeId);

  return (
    <div className="space-y-6">
      <InterviewQuestionBankPanel jobId={jobId} jobTitle={jobTitle} compact />

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
          <Mic className="h-4 w-4 text-primary" />
          Analyze interview signals
        </h3>
        <textarea
          className="input-hr min-h-[140px] text-sm leading-relaxed"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste transcript here to analyze…"
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
