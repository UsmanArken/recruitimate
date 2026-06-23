"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Files, Upload } from "lucide-react";
import { isAllowedResumeFile } from "@/lib/resume/extract-text";
import { JobPositionPicker } from "@/components/features/candidates/job-position-picker";
import type { JobOption } from "@/lib/api/jobs-client";
import {
  BulkImportResultCard,
  type BulkImportResultCardData,
} from "@/components/features/jobs/bulk-import-result-card";
import { formatScore, scoreColor } from "@/lib/utils";
import Link from "next/link";

type BulkResult =
  | BulkImportResultCardData
  | { status: "failed"; fileName: string; error: string; code?: string };

type TalentPoolResult = {
  status: "created" | "duplicate" | "failed";
  fileName: string;
  candidateId?: string;
  candidateName?: string;
  suggestedRoles?: { jobId: string; jobTitle: string; estimatedFit: number }[];
  error?: string;
  message?: string;
};

function pickResumeFiles(files: File[]): File[] {
  return files.filter((f) => isAllowedResumeFile(f.name, f.type));
}

export function CandidatesBulkIntakePanel({ jobs }: { jobs: JobOption[] }) {
  const router = useRouter();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"talent_pool" | "role">("talent_pool");
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleResults, setRoleResults] = useState<BulkResult[] | null>(null);
  const [poolResults, setPoolResults] = useState<TalentPoolResult[] | null>(null);

  function setPickedFiles(all: File[]) {
    const resumes = pickResumeFiles(all);
    setFiles(resumes);
    setSkippedCount(Math.max(0, all.length - resumes.length));
    setRoleResults(null);
    setPoolResults(null);
    setError(
      resumes.length === 0 && all.length > 0
        ? "No PDF or DOCX files found. Only .pdf and .docx are supported."
        : null
    );
  }

  async function upload() {
    if (files.length === 0) {
      setError("Add resumes using the drop zone or folder picker.");
      return;
    }
    if (mode === "role" && !jobId) {
      setError("Select an open role for role-specific screening.");
      return;
    }

    setLoading(true);
    setError(null);
    setRoleResults(null);
    setPoolResults(null);

    const form = new FormData();
    for (const f of files) form.append("files", f);
    if (mode === "role" && jobId) form.append("jobId", jobId);

    const endpoint =
      mode === "role" && jobId
        ? `/api/jobs/${jobId}/bulk-resumes`
        : "/api/candidates/bulk-resumes";

    const res = await fetch(endpoint, {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Upload failed");
      return;
    }

    const data = await res.json();
    if (mode === "role") {
      setRoleResults(data.results ?? data);
    } else {
      setPoolResults(data.results ?? []);
    }
    router.refresh();
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          Bulk resume upload
        </CardTitle>
        <CardDescription>
          Import many CVs at once — screen against a specific role or add to your talent pool with
          suggested role matches.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("talent_pool")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "talent_pool"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            Talent pool (match to roles)
          </button>
          <button
            type="button"
            onClick={() => setMode("role")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "role"
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted hover:text-foreground"
            }`}
          >
            Screen for one role
          </button>
        </div>

        {mode === "role" && jobs.length > 0 && (
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Open role</span>
            <JobPositionPicker
              jobs={jobs}
              value={jobId}
              onChange={setJobId}
              required
              className="mt-1.5"
            />
          </label>
        )}

        {mode === "role" && jobs.length === 0 && (
          <p className="text-sm text-muted">
            Post an open role first, or use talent pool mode to import and match CVs generically.
          </p>
        )}

        <FileDropZone
          onFiles={setPickedFiles}
          disabled={loading}
          hint="PDF or DOCX · up to 40 files"
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => folderInputRef.current?.click()}>
            <FolderOpen className="h-4 w-4" />
            Pick folder
          </Button>
          <input
            ref={folderInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              setPickedFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          {files.length > 0 && (
            <span className="flex items-center gap-1 text-sm text-muted">
              <Files className="h-4 w-4" />
              {files.length} file{files.length === 1 ? "" : "s"}
              {skippedCount > 0 ? ` (${skippedCount} skipped)` : ""}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-risk">{error}</p>}

        <Button type="button" disabled={loading || files.length === 0} onClick={() => void upload()}>
          {loading ? "Processing…" : "Upload & process"}
        </Button>

        {roleResults && (
          <div className="space-y-3 border-t border-border-subtle pt-4">
            {roleResults.map((r, i) =>
              r.status === "failed" ? (
                <p key={`${r.fileName}-${i}`} className="text-sm text-risk">
                  {r.fileName}: {r.error}
                </p>
              ) : (
                <BulkImportResultCard key={`${r.fileName}-${i}`} row={r} />
              )
            )}
          </div>
        )}

        {poolResults && (
          <div className="space-y-3 border-t border-border-subtle pt-4">
            {poolResults.map((r, i) => (
              <div
                key={`${r.fileName}-${i}`}
                className="rounded-lg border border-border-subtle bg-background px-4 py-3 text-sm"
              >
                <p className="font-semibold text-foreground">
                  {r.fileName}
                  {r.candidateName ? ` → ${r.candidateName}` : ""}
                </p>
                {r.status === "failed" && (
                  <p className="mt-1 text-risk">{r.error ?? "Import failed"}</p>
                )}
                {r.message && <p className="mt-1 text-muted">{r.message}</p>}
                {r.suggestedRoles && r.suggestedRoles.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {r.suggestedRoles.map((s) => (
                      <li key={s.jobId} className="flex flex-wrap items-center gap-2 text-muted">
                        <span>Best fit:</span>
                        <span className="font-medium text-foreground">{s.jobTitle}</span>
                        <span className={scoreColor(s.estimatedFit)}>
                          {formatScore(s.estimatedFit)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {r.candidateId && (
                  <Link
                    href={`/candidates/${r.candidateId}`}
                    className="mt-2 inline-block font-semibold text-primary hover:underline"
                  >
                    View profile
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
