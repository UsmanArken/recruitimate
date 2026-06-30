"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ResumeUploadField } from "@/components/features/candidates/resume-upload-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { TrustBanner } from "@/components/features/intelligence/trust-banner";
import { Briefcase, Sparkles } from "lucide-react";
import type { JobOption } from "@/lib/api/jobs-client";
import { JobPositionPicker } from "@/components/features/candidates/job-position-picker";
import { LinkedInImportField } from "@/components/features/candidates/linkedin-import-field";
import { cn } from "@/lib/utils";

export function NewCandidateForm({
  jobs,
  loadError,
}: {
  jobs: JobOption[];
  loadError?: string | null;
}) {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [linkedInText, setLinkedInText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Controlled fields so we can auto-fill from the parsed CV
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [autoFilledName, setAutoFilledName] = useState(false);
  const [autoFilledEmail, setAutoFilledEmail] = useState(false);

  function handleIdentityExtracted(identity: { name?: string | null; email?: string | null }) {
    if (identity.name) {
      // Only auto-fill if the field is empty — never overwrite user input
      if (!name.trim()) {
        setName(identity.name);
        setAutoFilledName(true);
      }
    } else {
      setAutoFilledName(false);
    }
    if (identity.email) {
      if (!email.trim()) {
        setEmail(identity.email);
        setAutoFilledEmail(true);
      }
    } else {
      setAutoFilledEmail(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const jobId = fd.get("jobId") as string;

    if (!jobId) {
      setError("Select an open position — every applicant is evaluated against a hiring campaign.");
      setLoading(false);
      return;
    }

    try {
      const candidate = await apiFetch<{ id: string; applications?: Array<{ id: string }> }>("/api/candidates", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          jobId,
          resumeText: resumeText.trim(),
          linkedInText: linkedInText.trim() || undefined,
          linkedInUrl: fd.get("linkedInUrl") || undefined,
          githubUrl: fd.get("githubUrl") || undefined,
        }),
      });
      const firstApp = candidate.applications?.[0];
      if (firstApp?.id) {
        router.push(`/candidates/${candidate.id}/applications/${firstApp.id}`);
      } else {
        router.push(`/candidates/${candidate.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add candidate.");
      setLoading(false);
    }
  }

  return (
    <>
      <LayerBadge layer="talent" />
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Applicant intake
          </CardTitle>
          <CardDescription>
            Upload the CV first — name and email are filled in automatically. Then choose the
            open position and submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError && (
            <p className="mb-4 rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{loadError}</p>
          )}
          {jobs.length === 0 ? (
            <div className="rounded-xl border border-warning/30 bg-warning-bg/40 p-6 text-center">
              <p className="font-medium text-foreground">Create an open position first</p>
              <p className="mt-2 text-sm text-muted">
                A hiring campaign defines the role, requirements, and interview team. Post a role
                on Open Roles, then return here to add applicants.
              </p>
              <ButtonLink href="/jobs/new" className="mt-4 inline-flex">
                Post new role
              </ButtonLink>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              {/* CV upload first — drives auto-fill */}
              <ResumeUploadField
                resumeText={resumeText}
                onResumeTextChange={setResumeText}
                onIdentityExtracted={handleIdentityExtracted}
                required
              />

              <label className="block">
                <span className="text-sm font-semibold text-foreground">
                  Open position (hiring campaign) <span className="text-risk">*</span>
                </span>
                <JobPositionPicker jobs={jobs} name="jobId" required className="mt-1.5" />
                <p className="mt-1.5 text-xs text-muted">
                  Role fit compares this resume to the position requirements.
                </p>
              </label>

              <AutoFillField
                label="Full name"
                name="name"
                required
                value={name}
                onChange={(v) => { setName(v); setAutoFilledName(false); }}
                autoFilled={autoFilledName}
              />
              <AutoFillField
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(v) => { setEmail(v); setAutoFilledEmail(false); }}
                autoFilled={autoFilledEmail}
              />

              <Field label="LinkedIn profile URL" name="linkedInUrl" />
              <LinkedInImportField onProfileText={setLinkedInText} />
              <Field label="GitHub / portfolio" name="githubUrl" />

              <TrustBanner>
                Preliminary screening is advisory. Final hire recommendations require
                interview signals — never from resume alone.
              </TrustBanner>
              {error && (
                <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
              )}
              <Button
                type="submit"
                disabled={
                  loading || !name.trim() || resumeText.trim().length + linkedInText.trim().length < 20
                }
              >
                {loading ? "Analyzing for this role…" : "Add & screen candidate"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function AutoFillField({
  label,
  name,
  required,
  type = "text",
  value,
  onChange,
  autoFilled,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFilled?: boolean;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-risk">*</span>}
        {autoFilled && (
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-2.5 w-2.5" />
            From CV
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "input-hr mt-1.5 transition-colors",
          autoFilled && "border-primary/40 bg-primary/5"
        )}
      />
    </label>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input name={name} type={type} required={required} className="input-hr mt-1.5" />
    </label>
  );
}
