"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCandidateAuth, type CandidateUser } from "@/lib/candidate-auth-client";

type Step = "credentials" | "resume" | "submitting";

interface Props {
  token: string;
}

export function ApplyForm({ token }: Props) {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("credentials");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // Credentials collected in step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Resume step
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [parsingResume, setParsingResume] = useState(false);

  // Whether the existing candidate already has a resume (skip step 2 if true)
  const [existingName, setExistingName] = useState<string | null>(null);

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
      // Non-fatal
    } finally {
      setParsingResume(false);
    }
  }

  async function handleCredentialsNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setChecking(true);

    try {
      const res = await fetch(`/api/apply/${token}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Something went wrong" }));
        throw new Error(body.detail ?? "Something went wrong");
      }

      const data: { exists: boolean; hasResume: boolean; name: string | null } = await res.json();

      if (data.exists) {
        // Pre-fill name from recruiter record if candidate hasn't typed one
        if (data.name && !name) setExistingName(data.name);
      }

      if (data.hasResume) {
        // Resume already on file — go straight to submit
        await submitApplication(data.hasResume);
      } else {
        setStep("resume");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleResumeNext(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitApplication(false);
  }

  async function submitApplication(skipResume: boolean) {
    setStep("submitting");
    setError(null);

    try {
      const res = await fetch(`/api/apply/${token}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: existingName ?? name,
          email,
          password,
          resumeText: skipResume ? undefined : (resumeText ?? undefined),
          linkedInUrl: linkedInUrl || undefined,
          githubUrl: githubUrl || undefined,
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
      setStep("resume");
    }
  }

  const inputClass =
    "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 w-full";

  if (step === "submitting") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="font-medium text-foreground">Submitting your application…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <span className={step === "credentials" ? "text-primary font-semibold" : ""}>
          1. Credentials
        </span>
        <span>›</span>
        <span className={step === "resume" ? "text-primary font-semibold" : ""}>
          2. Resume
        </span>
      </div>

      {step === "credentials" && (
        <form onSubmit={handleCredentialsNext} className="space-y-5">
          {!existingName && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Full name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Jane Smith"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">LinkedIn URL</label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className={inputClass}
                placeholder="https://linkedin.com/in/…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">GitHub URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className={inputClass}
                placeholder="https://github.com/…"
              />
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <Button type="submit" disabled={checking} className="h-11 w-full text-base">
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}

      {step === "resume" && (
        <form onSubmit={handleResumeNext} className="space-y-5">
          {existingName && (
            <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted">
              Welcome back, <span className="font-semibold text-foreground">{existingName}</span>.
              Please upload your resume to complete the application.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Resume <span className="font-normal text-muted">(recommended)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 transition hover:bg-muted/50">
              {parsingResume ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : resumeText ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Upload className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {parsingResume ? "Parsing…" : resumeName ? resumeName : "Upload PDF or text file"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={handleResumeChange}
              />
            </label>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-11 flex-1"
              onClick={() => { setStep("credentials"); setError(null); }}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={parsingResume}
              className="h-11 flex-1 text-base"
            >
              {parsingResume ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit application"
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-risk/20 bg-risk-bg px-4 py-3 text-sm text-risk"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
