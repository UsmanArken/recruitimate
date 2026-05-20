"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayerBadge } from "@/components/layer-badge";

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
      setError(data.error ? JSON.stringify(data.error) : "Failed to create candidate.");
      setLoading(false);
      return;
    }

    const candidate = await res.json();
    router.push(`/candidates/${candidate.id}`);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-2">
        <LayerBadge layer="talent" />
      </div>
      <h1 className="mb-1 text-2xl font-bold">Add candidate</h1>
      <p className="mb-6 text-sm text-muted">
        Paste a resume to run Talent Intelligence — skills, fit score, and hidden signals.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Candidate & resume</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name" name="name" required />
            <Field label="Email" name="email" type="email" />
            <label className="block">
              <span className="text-sm font-medium">Job (optional)</span>
              <select name="jobId" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">No job — general analysis</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>
            <Field label="LinkedIn URL" name="linkedInUrl" />
            <Field label="GitHub URL" name="githubUrl" />
            <Field
              label="Resume text"
              name="resumeText"
              required
              multiline
              placeholder="Paste CV/resume content here…"
              rows={12}
            />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Analyzing…" : "Analyze & create"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
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
  const className =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/10";
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          required={required}
          rows={rows ?? 4}
          placeholder={placeholder}
          className={`mt-1 ${className}`}
        />
      ) : (
        <input name={name} type={type} required={required} className={`mt-1 ${className}`} />
      )}
    </label>
  );
}
