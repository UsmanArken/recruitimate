"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export type HiringClientOption = {
  id: string;
  name: string;
  website: string | null;
};

type JobFormValues = {
  title: string;
  description: string;
  requirements: string;
  jobPostDocument: string;
  hiringClientId: string;
};

export function JobForm({
  clients,
  initial,
  jobId,
  submitLabel,
}: {
  clients: HiringClientOption[];
  initial?: Partial<JobFormValues>;
  jobId?: string;
  submitLabel: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<JobFormValues>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    requirements: initial?.requirements ?? "",
    jobPostDocument: initial?.jobPostDocument ?? "",
    hiringClientId: initial?.hiringClientId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function generateFromClient() {
    if (!values.hiringClientId || !values.title.trim()) {
      setError("Select a client company and enter a job title first.");
      return;
    }
    setDraftLoading(true);
    setError(null);
    const res = await fetch(`/api/clients/${values.hiringClientId}/job-draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ title: values.title.trim() }),
    });
    setDraftLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not generate draft");
      return;
    }
    const draft = await res.json();
    setValues((v) => ({
      ...v,
      description: draft.description ?? v.description,
      requirements: draft.requirements ?? v.requirements,
      jobPostDocument: draft.jobPostDocument ?? v.jobPostDocument,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = jobId ? `/api/jobs/${jobId}` : "/api/jobs";
    const method = jobId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        ...values,
        hiringClientId: values.hiringClientId || undefined,
        requirements: values.requirements || undefined,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save role");
      return;
    }

    const job = await res.json();
    router.push(jobId ? `/jobs/${jobId}` : "/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-foreground">Client company</span>
        <select
          className="input-hr mt-1.5"
          value={values.hiringClientId}
          onChange={(e) => setField("hiringClientId", e.target.value)}
        >
          <option value="">— Select client (optional) —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.website ? ` · ${c.website.replace(/^https?:\/\//, "")}` : ""}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          Recruit for multiple client orgs from one workspace.{" "}
          <a href="/settings/clients" className="font-medium text-primary hover:underline">
            Manage companies
          </a>
        </p>
      </label>

      <Field
        label="Job title"
        value={values.title}
        onChange={(v) => setField("title", v)}
        required
        placeholder="e.g. Senior Backend Engineer"
      />

      {values.hiringClientId && (
        <Button
          type="button"
          variant="secondary"
          disabled={draftLoading || !values.title.trim()}
          onClick={() => void generateFromClient()}
        >
          <Sparkles className="h-4 w-4" />
          {draftLoading ? "Generating…" : "Generate JD from company profile"}
        </Button>
      )}

      <Field
        label="Internal description"
        value={values.description}
        onChange={(v) => setField("description", v)}
        required
        multiline
      />
      <Field
        label="Requirements (for fit scoring)"
        value={values.requirements}
        onChange={(v) => setField("requirements", v)}
        multiline
        placeholder="Skills, years of experience, must-haves…"
      />
      <Field
        label="Job post document"
        value={values.jobPostDocument}
        onChange={(v) => setField("jobPostDocument", v)}
        required
        multiline
        rows={8}
        hint="Public-facing post copy — required for every role."
      />

      {error && <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  multiline,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-risk"> *</span>}
      </span>
      {multiline ? (
        <textarea
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-hr mt-1.5"
        />
      ) : (
        <input
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input-hr mt-1.5"
        />
      )}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </label>
  );
}
