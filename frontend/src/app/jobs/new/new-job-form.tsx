"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export function NewJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      await apiFetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          requirements: fd.get("requirements") || undefined,
        }),
      });
      router.push("/jobs");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create role. Is the database running?");
      setLoading(false);
    }
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
