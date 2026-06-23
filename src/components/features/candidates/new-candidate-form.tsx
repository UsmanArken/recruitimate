"use client";

import { Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { ResumeUploadField } from "@/components/features/candidates/resume-upload-field";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/features/intelligence/trust-banner";
import { Briefcase, Sparkles } from "lucide-react";
import type { JobOption } from "@/lib/api/jobs-client";
import { JobPositionPicker } from "@/components/features/candidates/job-position-picker";
import { LinkedInImportField } from "@/components/features/candidates/linkedin-import-field";
import { useRouter } from "next/navigation";

type AutofillField = "name" | "email" | "linkedInUrl" | "githubUrl" | "portfolioUrl";

export function NewCandidateForm({
  jobs,
  loadError,
}: {
  jobs: JobOption[];
  loadError?: string | null;
}) {
  const router = useRouter();
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [resumeText, setResumeText] = useState("");
  const [linkedInText, setLinkedInText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [sourceFileName, setSourceFileName] = useState<string | undefined>();
  const [autofilled, setAutofilled] = useState<Set<AutofillField>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyAutofill(
    hints: {
      suggestedName: string;
      suggestedEmail?: string;
      suggestedLinkedInUrl?: string;
      suggestedGithubUrl?: string;
      suggestedPortfolioUrl?: string;
      fileName: string;
    },
    replace = false
  ) {
    const next = new Set(autofilled);
    setSourceFileName(hints.fileName);

    if ((replace || !name.trim()) && hints.suggestedName) {
      setName(hints.suggestedName);
      next.add("name");
    }
    if ((replace || !email.trim()) && hints.suggestedEmail) {
      setEmail(hints.suggestedEmail);
      next.add("email");
    }
    if ((replace || !linkedInUrl.trim()) && hints.suggestedLinkedInUrl) {
      setLinkedInUrl(hints.suggestedLinkedInUrl);
      next.add("linkedInUrl");
    }
    if ((replace || !githubUrl.trim()) && hints.suggestedGithubUrl) {
      setGithubUrl(hints.suggestedGithubUrl);
      next.add("githubUrl");
    }
    if ((replace || !portfolioUrl.trim()) && hints.suggestedPortfolioUrl) {
      setPortfolioUrl(hints.suggestedPortfolioUrl);
      next.add("portfolioUrl");
    }
    setAutofilled(next);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim() || undefined,
        jobId: jobId || undefined,
        resumeText: resumeText.trim(),
        linkedInText: linkedInText.trim() || undefined,
        linkedInUrl: linkedInUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        sourceFileName,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to add candidate.");
      setLoading(false);
      return;
    }

    const candidate = await res.json();
    const firstApp = candidate.applications?.[0];
    if (firstApp?.id) {
      router.push(`/candidates/${candidate.id}/applications/${firstApp.id}`);
    } else {
      router.push(`/candidates/${candidate.id}`);
    }
  }

  const talentPool = !jobId;

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
            Upload a CV first — we extract contact details and resume text. Choose a role for
            role-fit screening, or add to the talent pool for generic evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError && (
            <p className="mb-4 rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{loadError}</p>
          )}
          {jobs.length === 0 ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <p className="rounded-lg border border-warning/30 bg-warning-bg/40 px-3 py-2 text-sm text-muted">
                No open roles yet — candidates will be added to the talent pool. Post a role to
                unlock role-fit scoring and matching.
              </p>
              <ResumeUploadField
                resumeText={resumeText}
                onResumeTextChange={setResumeText}
                onParsed={(result) => applyAutofill(result, true)}
                required
              />
              {autofilled.size > 0 && (
                <div className="rounded-xl border border-success/25 bg-success-bg/50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-success" />
                    Auto-filled from resume
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {autofilled.has("name") && <li>Name: {name}</li>}
                    {autofilled.has("email") && <li>Email: {email}</li>}
                  </ul>
                </div>
              )}
              <Field label="Full name" value={name} onChange={setName} required />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <Button
                type="submit"
                disabled={loading || resumeText.trim().length < 20 || !name.trim()}
              >
                {loading ? "Screening resume…" : "Add to talent pool"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <ResumeUploadField
                resumeText={resumeText}
                onResumeTextChange={setResumeText}
                onParsed={(result) => applyAutofill(result, true)}
                required
              />

              {autofilled.size > 0 && (
                <div className="rounded-xl border border-success/25 bg-success-bg/50 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="h-4 w-4 text-success" />
                    Auto-filled from resume
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {autofilled.has("name") && <li>Name: {name}</li>}
                    {autofilled.has("email") && <li>Email: {email}</li>}
                    {autofilled.has("linkedInUrl") && <li>LinkedIn: {linkedInUrl}</li>}
                    {autofilled.has("githubUrl") && <li>GitHub: {githubUrl}</li>}
                    {autofilled.has("portfolioUrl") && <li>Portfolio: {portfolioUrl}</li>}
                  </ul>
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-foreground">Open position</span>
                <JobPositionPicker
                  jobs={jobs}
                  value={jobId}
                  onChange={setJobId}
                  allowTalentPool
                  required={false}
                  className="mt-1.5"
                />
                <p className="mt-1.5 text-xs text-muted">
                  {talentPool
                    ? "Talent pool runs generic screening — apply to a role later for fit scores."
                    : "Role fit compares this resume to the position requirements."}
                </p>
              </label>

              <Field label="Full name" value={name} onChange={setName} required />
              <Field label="Email" value={email} onChange={setEmail} type="email" />
              <Field label="LinkedIn profile URL" value={linkedInUrl} onChange={setLinkedInUrl} />
              <LinkedInImportField onProfileText={setLinkedInText} />
              <Field label="GitHub" value={githubUrl} onChange={setGithubUrl} />
              <Field label="Portfolio URL" value={portfolioUrl} onChange={setPortfolioUrl} />

              <TrustBanner>
                Screening is advisory. Role-fit scores require an open position; hire
                recommendations require interview signals.
              </TrustBanner>
              {error && (
                <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading || resumeText.trim().length + linkedInText.trim().length < 20}
              >
                {loading
                  ? talentPool
                    ? "Screening resume…"
                    : "Analyzing for this role…"
                  : talentPool
                    ? "Add to talent pool"
                    : "Add & screen for role"}
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
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-hr mt-1.5"
      />
    </label>
  );
}
