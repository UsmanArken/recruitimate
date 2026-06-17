"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { candidateFetch, ApiError } from "@/lib/api-candidate";

interface Props {
  initialName: string;
  initialEmail: string;
  initialLinkedInUrl: string;
  initialGithubUrl: string;
}

export function ProfileEditForm({ initialName, initialEmail, initialLinkedInUrl, initialGithubUrl }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reanalysing, setReanalysing] = useState(false);
  const [reanalysingTimer, setReanalysingTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      await candidateFetch("/api/candidate/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: fd.get("name") || undefined,
          email: fd.get("email") || undefined,
          linkedInUrl: fd.get("linkedInUrl") || undefined,
          githubUrl: fd.get("githubUrl") || undefined,
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await candidateFetch("/api/candidate/me/resume", { method: "POST", body: fd });
      if (reanalysingTimer) clearTimeout(reanalysingTimer);
      setReanalysing(true);
      // Auto-clear the "re-analysing" banner after 60s — Celery task completes in the background
      const t = setTimeout(() => setReanalysing(false), 60_000);
      setReanalysingTimer(t);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <input
            name="name"
            defaultValue={initialName}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={initialEmail}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">LinkedIn URL</label>
          <input
            name="linkedInUrl"
            type="url"
            defaultValue={initialLinkedInUrl}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://linkedin.com/in/…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">GitHub URL</label>
          <input
            name="githubUrl"
            type="url"
            defaultValue={initialGithubUrl}
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

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Saved successfully
        </div>
      )}

      {reanalysing && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Re-analysing your profile…
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving} className="h-8 px-3 text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/40">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Re-upload resume"}
          <input
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
            disabled={uploading}
          />
        </label>
      </div>
    </form>
  );
}
