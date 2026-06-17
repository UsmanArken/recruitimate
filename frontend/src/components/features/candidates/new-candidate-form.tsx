"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ResumeUploadField } from "@/components/features/candidates/resume-upload-field";
import { Button, ButtonLink } from "@/components/ui/button";
import { TrustBanner } from "@/components/features/intelligence/trust-banner";
import { Briefcase } from "lucide-react";
import type { JobOption } from "@/lib/api/jobs-client";
import { JobPositionPicker } from "@/components/features/candidates/job-position-picker";
import { LinkedInImportField } from "@/components/features/candidates/linkedin-import-field";

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
          name: fd.get("name"),
          email: fd.get("email") || undefined,
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
            Choose the open position first, then upload or paste the resume. Role fit and next
            steps are scoped to that requisition — we do not show fake hire scores without
            context.
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
              <label className="block">
                <span className="text-sm font-semibold text-foreground">
                  Open position (hiring campaign) <span className="text-risk">*</span>
                </span>
                <JobPositionPicker jobs={jobs} name="jobId" required className="mt-1.5" />
                <p className="mt-1.5 text-xs text-muted">
                  Role fit compares this resume to the position requirements.
                </p>
              </label>
              <Field label="Full name" name="name" required />
              <Field label="Email" name="email" type="email" />
              <Field label="LinkedIn profile URL" name="linkedInUrl" />
              <LinkedInImportField onProfileText={setLinkedInText} />
              <Field label="GitHub / portfolio" name="githubUrl" />
              <ResumeUploadField
                resumeText={resumeText}
                onResumeTextChange={setResumeText}
                required
              />
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
                  loading || resumeText.trim().length + linkedInText.trim().length < 20
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
