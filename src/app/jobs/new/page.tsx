"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        requirements: fd.get("requirements") || undefined,
      }),
    });

    if (!res.ok) {
      setError("Failed to create job. Is the database running?");
      setLoading(false);
      return;
    }
    router.push("/jobs");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">New job</h1>
      <Card>
        <CardHeader>
          <CardTitle>Role details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Title" name="title" required />
            <Field label="Description" name="description" required multiline />
            <Field label="Requirements (for fit scoring)" name="requirements" multiline />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create job"}
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
}: {
  label: string;
  name: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const className =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/10";
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea name={name} required={required} rows={4} className={`mt-1 ${className}`} />
      ) : (
        <input name={name} required={required} className={`mt-1 ${className}`} />
      )}
    </label>
  );
}
