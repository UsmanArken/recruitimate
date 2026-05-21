"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LayerBadge } from "@/components/features/intelligence/layer-badge";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/features/intelligence/trust-banner";

type Job = { id: string; title: string };

export default function NewCandidatePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then(setJobs)
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email") || undefined,
        jobId: fd.get("jobId") || undefined,
        resumeText: fd.get("resumeText"),
        linkedInUrl: fd.get("linkedInUrl") || undefined,
        githubUrl: fd.get("githubUrl") || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ? JSON.stringify(data.error) : "Failed to add candidate.");
      setLoading(false);
      return;
    }

    const candidate = await res.json();
    router.push(`/candidates/${candidate.id}`);
  }

  return (
    <>
      <PageHeader
        title="Add candidate"
        description="Import an applicant to run talent intelligence and generate an initial hiring profile."
      />
      <PageBody className="max-w-2xl">
        <LayerBadge layer="talent" />
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Applicant details</CardTitle>
            <CardDescription>
              Paste resume content below. We&apos;ll extract skills, fit score, and preliminary
              signals for your review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Full name" name="name" required />
              <Field label="Email" name="email" type="email" />
              <label className="block">
                <span className="text-sm font-semibold text-foreground">Open role</span>
                <select name="jobId" className="input-hr mt-1.5">
                  <option value="">General pipeline (no role)</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="LinkedIn profile" name="linkedInUrl" />
              <Field label="GitHub / portfolio" name="githubUrl" />
              <Field
                label="Resume content"
                name="resumeText"
                required
                multiline
                placeholder="Paste the candidate's CV or resume text here…"
                rows={12}
              />
              <TrustBanner>
                Analysis is explainable and advisory. Review all signals before making hiring
                decisions.
              </TrustBanner>
              {error && (
                <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Analyzing profile…" : "Add & analyze candidate"}
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
  rows,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
  rows?: number;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          rows={rows ?? 4}
          placeholder={placeholder}
          className="input-hr mt-1.5"
        />
      ) : (
        <input name={name} type={type} required={required} className="input-hr mt-1.5" />
      )}
    </label>
  );
}
