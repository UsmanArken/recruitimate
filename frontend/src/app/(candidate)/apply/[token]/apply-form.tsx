"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCandidateAuth, type CandidateUser } from "@/lib/candidate-auth-client";

interface Props {
  token: string;
}

export function ApplyForm({ token }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsingResume(true);
    setResumeName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setResumeText(data.text ?? null);
      }
    } catch {
      // Non-fatal — resume text may be empty, backend handles it
    } finally {
      setParsingResume(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/apply/${token}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          resumeText: resumeText ?? undefined,
          linkedInUrl: fd.get("linkedInUrl") || undefined,
          githubUrl: fd.get("githubUrl") || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Signup failed" }));
        throw new Error(body.detail ?? "Signup failed");
      }

      const data = await res.json();
      setCandidateAuth(data.access_token, data.candidate as CandidateUser);
      router.push("/candidate/dashboard?analysing=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Full name *</label>
          <input
            name="name"
            required
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Jane Smith"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email *</label>
          <input
            name="email"
            type="email"
            required
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="jane@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Password *</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="At least 8 characters"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Resume *</label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 transition hover:bg-muted/50">
          {parsingResume ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : resumeText ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {parsingResume
              ? "Parsing…"
              : resumeName
                ? resumeName
                : "Upload PDF or text file"}
          </span>
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={handleResumeChange}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">LinkedIn URL</label>
          <input
            name="linkedInUrl"
            type="url"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://linkedin.com/in/…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">GitHub URL</label>
          <input
            name="githubUrl"
            type="url"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://github.com/…"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-risk/20 bg-risk-bg px-4 py-3 text-sm text-risk"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || parsingResume}
        className="h-11 w-full text-base"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting application…
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  );
}
