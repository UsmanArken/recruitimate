"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, CheckCheck, Wand2, Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

type Client = { id: string; name: string };

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

  // Client + JD generation
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jobPostDocument, setJobPostDocument] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Client[]>("/api/clients")
      .then(setClients)
      .catch(() => {});
  }, []);

  async function generateJD() {
    if (!selectedClientId || !title.trim()) return;
    setGenerating(true);
    setGenError(null);
    try {
      const draft = await apiFetch<{
        description: string;
        requirements: string;
        jobPostDocument: string;
      }>(`/api/clients/${selectedClientId}/job-draft`, {
        method: "POST",
        body: JSON.stringify({ title: title.trim() }),
      });
      setDescription(draft.description);
      setRequirements(draft.requirements);
      setJobPostDocument(draft.jobPostDocument);
    } catch (err) {
      setGenError(err instanceof ApiError ? err.message : "Failed to generate job description.");
    } finally {
      setGenerating(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const job = await apiFetch<CreatedJob>("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim() || fd.get("title"),
          description: description || (fd.get("description") as string) || undefined,
          requirements: requirements || (fd.get("requirements") as string) || undefined,
          jobPostDocument: jobPostDocument || undefined,
          hiringClientId: selectedClientId || undefined,
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

  const canGenerate = Boolean(selectedClientId && title.trim());

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
              Select a client and enter the role title, then use AI to generate the full job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">

              {/* Client selector */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Client company</span>
                <p className="mt-0.5 text-xs text-muted">
                  Required for AI job description generation.{" "}
                  <a href="/settings/clients" className="text-primary hover:underline">Manage clients →</a>
                </p>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="input-hr mt-1.5"
                >
                  <option value="">No client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              {/* Title + Generate button */}
              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">
                    Job title <span className="text-risk">*</span>
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    className="input-hr mt-1.5"
                  />
                </label>
                <button
                  type="button"
                  onClick={generateJD}
                  disabled={!canGenerate || generating}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generating ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</>
                  ) : (
                    <><Wand2 className="h-3.5 w-3.5" /> Generate JD from client profile</>
                  )}
                </button>
                {genError && (
                  <p className="mt-1.5 text-xs text-risk">{genError}</p>
                )}
                {!canGenerate && (
                  <p className="mt-1 text-xs text-muted">Select a client and enter a title to enable generation.</p>
                )}
              </div>

              {/* Description */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground">
                  Description <span className="text-risk">*</span>
                </span>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="input-hr mt-1.5"
                />
              </label>

              {/* Requirements */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Requirements (for fit scoring)</span>
                <textarea
                  name="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={4}
                  placeholder="Skills, years of experience, must-haves…"
                  className="input-hr mt-1.5"
                />
              </label>

              {/* Public job post */}
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Public job post</span>
                <p className="mt-0.5 text-xs text-muted">
                  This is what candidates read when they visit the apply link.
                </p>
                <textarea
                  name="jobPostDocument"
                  value={jobPostDocument}
                  onChange={(e) => setJobPostDocument(e.target.value)}
                  rows={6}
                  placeholder="Write a compelling job post for candidates…"
                  className="input-hr mt-1.5"
                />
              </label>

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
