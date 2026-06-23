"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Send } from "lucide-react";
import type { CopilotChatResult } from "@/lib/intelligence/types";
import { COPILOT_STARTER_PROMPTS } from "@/lib/intelligence/copilot/intent-engine";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  result?: CopilotChatResult;
};

type JobOption = { id: string; title: string };
type AppOption = {
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
};

export function CopilotChatPanel() {
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [applications, setApplications] = useState<AppOption[]>([]);
  const [jobId, setJobId] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I'm your hiring copilot. Select a role, then ask me to rank candidates, compare two applicants, or summarize an interview.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const jobApps = applications.filter((a) => !jobId || a.jobId === jobId);

  const loadContext = useCallback(async () => {
    const res = await fetch("/api/copilot/chat", { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setJobs(data.jobs ?? []);
      setApplications(data.applications ?? []);
    }
  }, []);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message) return;

    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const body: Record<string, string | [string, string]> = { message };
      if (jobId) body.jobId = jobId;
      if (applicationId) body.applicationId = applicationId;
      if (compareA && compareB) body.compareApplicationIds = [compareA, compareB];

      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Copilot request failed");
        return;
      }

      const result = data as CopilotChatResult;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply, result },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[min(70vh,720px)] flex-col rounded-xl border-2 border-primary/20 bg-card shadow-sm">
      <div className="border-b border-border-subtle px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-primary" />
          Hiring copilot
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
            P2-018
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted">
          Rank pipeline candidates, compare finalists, and summarize interviews.
        </p>
      </div>

      <div className="grid gap-2 border-b border-border-subtle bg-background/40 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="">Select role…</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={compareA}
          onChange={(e) => setCompareA(e.target.value)}
        >
          <option value="">Compare A…</option>
          {jobApps.map((a) => (
            <option key={a.applicationId} value={a.applicationId}>
              {a.candidateName}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={compareB}
          onChange={(e) => setCompareB(e.target.value)}
        >
          <option value="">Compare B…</option>
          {jobApps.map((a) => (
            <option key={a.applicationId} value={a.applicationId}>
              {a.candidateName}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        >
          <option value="">Interview context…</option>
          {jobApps.map((a) => (
            <option key={a.applicationId} value={a.applicationId}>
              {a.candidateName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-background ring-1 ring-border-subtle"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.result?.citations && m.result.citations.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-border-subtle pt-2 text-xs">
                {m.result.citations.map((c) => (
                  <li key={c.label}>
                    {c.href ? (
                      <Link href={c.href} className="font-medium text-primary hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      c.label
                    )}
                    {c.detail && <span className="text-muted"> — {c.detail}</span>}
                  </li>
                ))}
              </ul>
            )}
            {m.result && (
              <p className="mt-2 text-[10px] uppercase text-muted">
                {m.result.intent.replace(/_/g, " ")}
                {m.result.intent === "compare_candidates" && (
                  <span className="ml-1 text-success">· P2-019</span>
                )}
                {m.result.intent === "interview_summary" && (
                  <span className="ml-1 text-success">· P2-020</span>
                )}
              </p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-subtle p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {COPILOT_STARTER_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              className="rounded-full bg-background px-2.5 py-1 text-[11px] text-muted ring-1 ring-border hover:text-primary"
              onClick={() => void send(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Ask the copilot…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send(input)}
          />
          <Button type="button" onClick={() => void send(input)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-risk">{error}</p>}
      </div>
    </div>
  );
}
