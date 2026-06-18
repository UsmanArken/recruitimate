"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2, Calendar, Download, Video, Copy, Check, Plus, Clock, CheckCircle2,
} from "lucide-react";
import {
  ScheduleDateTimeField,
  defaultScheduleDateTime,
  scheduleDateTimeToIso,
  type ScheduleDateTimeValue,
} from "@/components/features/candidates/schedule-datetime-field";
import { apiFetch, ApiError } from "@/lib/api-fetch";

export type InterviewRow = {
  id: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  meetingUrl: string | null;
  transcript: string | null;
  livekitRoomName: string | null;
  candidateJoinUrl: string | null;
  agentStatus: string | null;
};

// ─── Schedule form ────────────────────────────────────────────────────────────

function ScheduleForm({
  applicationId,
  onScheduled,
}: {
  applicationId: string;
  onScheduled: (id: string) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("Technical interview");
  const [when, setWhen] = useState<ScheduleDateTimeValue>(defaultScheduleDateTime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const scheduledAt = scheduleDateTimeToIso(when);
    if (!scheduledAt) { setError("Pick a date and time."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ id?: string; interview?: { id: string } }>(
        `/api/applications/${applicationId}/interviews`,
        { method: "POST", body: JSON.stringify({ title, scheduledAt }) },
      );
      const interview = data.interview ?? data;
      if (interview?.id) onScheduled(interview.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not schedule interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Title</span>
        <input
          className="input-hr mt-1.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Date & time</span>
        <div className="mt-1.5">
          <ScheduleDateTimeField value={when} onChange={setWhen} />
        </div>
      </div>
      {error && <p className="text-sm text-risk">{error}</p>}
      <Button type="button" disabled={loading} onClick={submit}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Calendar className="h-4 w-4" /> Schedule interview</>}
      </Button>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

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
  const [copied, setCopied] = useState(false);
  const [joiningInterview, setJoiningInterview] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showScheduleAnother, setShowScheduleAnother] = useState(false);

  const active = interviews.find((i) => i.id === activeId);
  const hasInterviews = interviews.length > 0;

  async function joinInterview() {
    if (!activeId) return;
    setJoiningInterview(true);
    setJoinError(null);
    try {
      const data = await apiFetch<{ token: string; joinUrl: string }>(
        `/api/applications/${applicationId}/interviews/${activeId}/token`,
      );
      const url = new URL(data.joinUrl, window.location.origin);
      url.searchParams.set("returnTo", window.location.pathname);
      window.open(url.toString(), "_blank");
    } catch (e) {
      setJoinError(e instanceof ApiError ? e.message : "Could not get join token");
    } finally {
      setJoiningInterview(false);
    }
  }

  async function copyCandidateLink() {
    if (!active?.candidateJoinUrl) return;
    await navigator.clipboard.writeText(active.candidateJoinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── State A: no interviews yet ──────────────────────────────────────────────
  if (!hasInterviews) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">No interview scheduled yet.</p>
        <ScheduleForm
          applicationId={applicationId}
          onScheduled={(id) => setActiveId(id)}
        />
      </div>
    );
  }

  // ── State B: interview finished (recording uploaded) ────────────────────────
  if (active?.agentStatus === "finished") {
    return (
      <div className="space-y-6">
        <InterviewHeader interview={active} />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">Recording uploaded</p>
            <p className="mt-0.5 text-sm text-muted">
              Audio analysis will be available in Phase 2.
            </p>
          </div>
        </div>
        <ScheduleAnotherToggle
          show={showScheduleAnother}
          onToggle={() => setShowScheduleAnother((v) => !v)}
          applicationId={applicationId}
          onScheduled={(id) => { setActiveId(id); setShowScheduleAnother(false); }}
        />
        <InterviewSelector interviews={interviews} activeId={activeId} onChange={setActiveId} />
      </div>
    );
  }

  // ── State C: scheduled / in progress ───────────────────────────────────────
  return (
    <div className="space-y-6">
      <InterviewHeader interview={active ?? null} />

      {/* Join block — only if LiveKit room exists */}
      {active?.livekitRoomName ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={joiningInterview}
              onClick={joinInterview}
              className="gap-2"
            >
              {joiningInterview
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Video className="h-4 w-4" />}
              Join Interview
            </Button>

            {active.scheduledAt && (
              <a
                href={`/api/applications/${applicationId}/interviews/${active.id}/calendar`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-card"
              >
                <Download className="h-3.5 w-3.5" />
                .ics invite
              </a>
            )}
          </div>

          {active.candidateJoinUrl && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                Candidate link
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <code className="min-w-0 flex-1 truncate text-xs text-foreground">
                  {active.candidateJoinUrl}
                </code>
                <button
                  type="button"
                  onClick={copyCandidateLink}
                  className="shrink-0 rounded p-1 text-muted-foreground transition hover:text-foreground"
                  title="Copy candidate link"
                >
                  {copied
                    ? <Check className="h-4 w-4 text-success" />
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted">
            Agent:{" "}
            <span className="font-medium capitalize text-foreground">
              {active.agentStatus ?? "pending"}
            </span>
          </p>

          {joinError && <p className="text-sm text-risk">{joinError}</p>}
        </div>
      ) : (
        /* Scheduled but room not yet created — shouldn't happen in normal flow */
        <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          Room not yet provisioned. Try refreshing.
        </div>
      )}

      <ScheduleAnotherToggle
        show={showScheduleAnother}
        onToggle={() => setShowScheduleAnother((v) => !v)}
        applicationId={applicationId}
        onScheduled={(id) => { setActiveId(id); setShowScheduleAnother(false); }}
      />

      <InterviewSelector interviews={interviews} activeId={activeId} onChange={setActiveId} />
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function InterviewHeader({ interview }: { interview: InterviewRow | null }) {
  if (!interview) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-base font-semibold text-foreground">{interview.title}</p>
        {interview.scheduledAt && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="h-3.5 w-3.5" />
            {new Date(interview.scheduledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>
      <StatusPill status={interview.status} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-green-100 text-green-700",
    ANALYZED: "bg-success-bg text-success",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? "bg-muted/40 text-muted"}`}>
      {status.toLowerCase().replace("_", " ")}
    </span>
  );
}

function ScheduleAnotherToggle({
  show,
  onToggle,
  applicationId,
  onScheduled,
}: {
  show: boolean;
  onToggle: () => void;
  applicationId: string;
  onScheduled: (id: string) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        {show ? "Cancel" : "Schedule another interview"}
      </button>
      {show && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <ScheduleForm applicationId={applicationId} onScheduled={onScheduled} />
        </div>
      )}
    </div>
  );
}

function InterviewSelector({
  interviews,
  activeId,
  onChange,
}: {
  interviews: InterviewRow[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  if (interviews.length <= 1) return null;
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        Switch interview
      </span>
      <select
        className="input-hr mt-1.5"
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
      >
        {interviews.map((i) => (
          <option key={i.id} value={i.id}>
            {i.title} — {i.status.toLowerCase().replace("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
