"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Lock } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  jobId: string;
  initial: {
    title: string;
    description: string | null;
    requirements: string | null;
    jobPostDocument: string | null;
  };
  hasApplications: boolean;
}

export function JobEditForm({ jobId, initial, hasApplications }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? "");
  const [requirements, setRequirements] = useState(initial.requirements ?? "");
  const [jobPostDocument, setJobPostDocument] = useState(initial.jobPostDocument ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle(initial.title);
    setDescription(initial.description ?? "");
    setRequirements(initial.requirements ?? "");
    setJobPostDocument(initial.jobPostDocument ?? "");
    setError(null);
    setOpen(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = {
        title: title.trim(),
        jobPostDocument,
      };
      if (!hasApplications) {
        body.description = description;
        body.requirements = requirements;
      }
      await apiFetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      router.refresh();
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:bg-muted/40 hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit role
      </button>
    );
  }

  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Edit role</CardTitle>
            {hasApplications && (
              <CardDescription className="mt-1 flex items-center gap-1.5 text-warning">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Applications exist — description and requirements are locked to protect screening results.
                Only the title and public job post can be changed.
              </CardDescription>
            )}
            {!hasApplications && (
              <CardDescription>
                No applications yet — all fields are editable.
              </CardDescription>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-md p-1.5 text-muted transition hover:bg-muted/40 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4">

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Job title <span className="text-risk">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-hr mt-1.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Description</span>
            {hasApplications ? (
              <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                <p className="whitespace-pre-wrap text-sm text-muted">{description || "—"}</p>
              </div>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input-hr mt-1.5"
              />
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Requirements
              {hasApplications && (
                <span className="ml-2 text-xs font-normal text-muted">(locked — used for scoring)</span>
              )}
            </span>
            {hasApplications ? (
              <div className="mt-1.5 flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                <p className="whitespace-pre-wrap text-sm text-muted">{requirements || "—"}</p>
              </div>
            ) : (
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={4}
                placeholder="Skills, years of experience, must-haves…"
                className="input-hr mt-1.5"
              />
            )}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">Public job post</span>
            <p className="mt-0.5 text-xs text-muted">
              The candidate-facing description shown on the apply page.
            </p>
            <textarea
              value={jobPostDocument}
              onChange={(e) => setJobPostDocument(e.target.value)}
              rows={5}
              placeholder="Write a compelling job post for candidates…"
              className="input-hr mt-1.5"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={reset}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
