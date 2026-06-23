"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatScore, scoreColor } from "@/lib/utils";
import { FlaskConical, Loader2, Send } from "lucide-react";
import type { AssessmentEvaluationResult } from "@/lib/intelligence/types";

type TaskRow = {
  id: string;
  title: string;
  taskType: string;
  prompt: string;
  difficulty: string;
};

type SubmissionRow = {
  id: string;
  taskId: string;
  status: string;
  overallScore: number | null;
  responseText: string | null;
  evaluation: AssessmentEvaluationResult | null;
};

export function ApplicationAssessmentPanel({ applicationId }: { applicationId: string }) {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/assessments`, {
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTasks(data.tasks ?? []);
        setSubmissions(
          (data.submissions ?? []).map((s: SubmissionRow & { evaluation: unknown }) => ({
            ...s,
            evaluation: s.evaluation as AssessmentEvaluationResult | null,
          }))
        );
        if (!selectedTaskId && data.tasks?.[0]?.id) {
          setSelectedTaskId(data.tasks[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [applicationId, selectedTaskId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const selectedSubmission = submissions.find((s) => s.taskId === selectedTaskId);

  async function submit() {
    if (!selectedTaskId || responseText.trim().length < 50) {
      setError("Select a task and write at least 50 characters.");
      return;
    }
    setBusy("submit");
    setError(null);
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/assessments/${selectedTaskId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ responseText: responseText.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Submit failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function evaluate() {
    if (!selectedTaskId) return;
    setBusy("evaluate");
    setError(null);
    try {
      const res = await fetch(
        `/api/applications/${applicationId}/assessments/${selectedTaskId}/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            responseText: responseText.trim() || undefined,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Evaluation failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading assessments…</p>;

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted">
        No assessment tasks for this role yet. Generate tasks on the job page first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <select
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
      >
        {tasks.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title} ({t.taskType})
          </option>
        ))}
      </select>

      {selectedTask && (
        <div className="rounded-lg border border-border-subtle bg-background/50 p-3">
          <p className="text-xs font-semibold uppercase text-muted">Task prompt</p>
          <p className="mt-2 whitespace-pre-wrap text-sm">{selectedTask.prompt}</p>
        </div>
      )}

      <textarea
        className="min-h-[140px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Candidate response (design doc, prioritization write-up, incident playbook…)"
        value={responseText || selectedSubmission?.responseText || ""}
        onChange={(e) => setResponseText(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          onClick={() => void submit()}
          disabled={busy !== null}
        >
          {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit response
        </Button>
        <Button
          type="button"
          className="px-3 py-1.5 text-xs"
          onClick={() => void evaluate()}
          disabled={busy !== null}
        >
          {busy === "evaluate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
          Evaluate
          <span className="rounded bg-amber-500/10 px-1 text-[9px] text-amber-700">P2-016</span>
        </Button>
      </div>

      {error && <p className="text-xs text-risk">{error}</p>}

      {selectedSubmission?.overallScore != null && (
        <div className="rounded-lg border border-border-subtle p-3">
          <p className="text-xs font-semibold uppercase text-muted">
            Evaluation · feeds hire confidence
            <span className="ml-2 rounded bg-emerald-500/10 px-1 text-[9px] text-success">P2-017</span>
          </p>
          <p className={`mt-1 text-2xl font-bold ${scoreColor(selectedSubmission.overallScore)}`}>
            {formatScore(selectedSubmission.overallScore)}
          </p>
          {selectedSubmission.evaluation?.explanation && (
            <p className="mt-2 text-xs text-muted">{selectedSubmission.evaluation.explanation}</p>
          )}
          {selectedSubmission.evaluation?.strengths?.[0] && (
            <p className="mt-1 text-xs text-success">{selectedSubmission.evaluation.strengths[0]}</p>
          )}
        </div>
      )}
    </div>
  );
}
