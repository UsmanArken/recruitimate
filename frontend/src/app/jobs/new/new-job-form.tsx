"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

interface CreatedJob {
  id: string;
  signupToken: string;
}

export function NewJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdJob, setCreatedJob] = useState<CreatedJob | null>(null);
  const [copied, setCopied] = useState(false);
  const [interviewMode, setInterviewMode] = useState<"live" | "automated">("live");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const job = await apiFetch<CreatedJob>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          requirements: fd.get("requirements") || undefined,
          interviewMode,
          autoInterviewThreshold: interviewMode === "automated"
            ? Number(fd.get("autoInterviewThreshold") ?? 60)
            : 60,
        }),
      });
      setCreatedJob(job);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create role. Is the database running?");
      setLoading(false);
    }
  }

  function signupUrl(token: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/apply/${token}`;
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(signupUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (createdJob) {
    const url = signupUrl(createdJob.signupToken);
    return (
      <>
        <PageHeader title="Role created" description="Share this link with candidates to start receiving applications." />
        <PageBody className="max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Candidate signup link</CardTitle>
              <CardDescription>Candidates will use this link to apply directly for this role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="flex-1 truncate text-sm text-foreground">{url}</span>
                <button
                  onClick={() => copyLink(createdJob.signupToken)}
                  className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                >
                  {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <Button onClick={() => router.push("/jobs")}>Go to jobs list</Button>
            </CardContent>
          </Card>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Post new role"
        description="Create a requisition so candidates can be scored against role requirements."
      />
      <PageBody className="max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Role details</CardTitle>
            <CardDescription>
              Include requirements to improve role-fit scoring accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Job title" name="title" required placeholder="e.g. Senior Backend Engineer" />
              <Field label="Description" name="description" required multiline />
              <Field
                label="Requirements (for fit scoring)"
                name="requirements"
                multiline
                placeholder="Skills, years of experience, must-haves…"
              />

              {/* Interview mode */}
              <div>
                <span className="text-sm font-semibold text-foreground">Interview type</span>
                <div className="mt-2 flex gap-3">
                  {(["live", "automated"] as const).map((mode) => (
                    <label
                      key={mode}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                        interviewMode === mode
                          ? "border-primary bg-primary/5 font-medium text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="interviewMode"
                        value={mode}
                        checked={interviewMode === mode}
                        onChange={() => setInterviewMode(mode)}
                        className="sr-only"
                      />
                      {mode === "live" ? "Recruiter-led" : "Automated (AI)"}
                    </label>
                  ))}
                </div>
              </div>

              {interviewMode === "automated" && (
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">
                    Auto-interview threshold (0–100)
                  </span>
                  <p className="mt-0.5 text-xs text-muted">
                    Candidates whose fit score meets or exceeds this will be auto-scheduled for an AI interview.
                  </p>
                  <input
                    name="autoInterviewThreshold"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={60}
                    className="input-hr mt-1.5 w-24"
                  />
                </label>
              )}

              {error && (
                <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create role"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}

function Field({
  label,
  name,
  required,
  multiline,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {multiline ? (
        <textarea name={name} required={required} rows={4} className="input-hr mt-1.5" />
      ) : (
        <input
          name={name}
          required={required}
          placeholder={placeholder}
          className="input-hr mt-1.5"
        />
      )}
    </label>
  );
}
