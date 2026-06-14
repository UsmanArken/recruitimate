"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileDropZone } from "@/components/ui/file-drop-zone";
import { FolderOpen, Files, ArrowRight } from "lucide-react";
import { isAllowedResumeFile } from "@/lib/resume/extract-text";
import {
  BulkImportResultCard,
  type BulkImportResultCardData,
} from "@/components/features/jobs/bulk-import-result-card";

type BulkResult =
  | BulkImportResultCardData
  | { status: "failed"; fileName: string; error: string; code?: string };

function pickResumeFiles(files: File[]): File[] {
  return files.filter((f) => isAllowedResumeFile(f.name, f.type));
}

export function BulkResumeUploadPanel({ jobId }: { jobId: string }) {
  const router = useRouter();
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResult[] | null>(null);

  function setPickedFiles(all: File[]) {
    const resumes = pickResumeFiles(all);
    setFiles(resumes);
    setSkippedCount(Math.max(0, all.length - resumes.length));
    setResults(null);
    setError(
      resumes.length === 0 && all.length > 0
        ? "No PDF or DOCX files found. Only .pdf and .docx are supported."
        : null
    );
  }

  function openFolderPicker() {
    const el = folderInputRef.current;
    if (!el) return;
    el.setAttribute("multiple", "");
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
    el.removeAttribute("accept");
    el.click();
  }

  function onFolderPick(e: React.ChangeEvent<HTMLInputElement>) {
    setPickedFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  async function upload() {
    if (files.length === 0) {
      setError("Add resumes using the drop zone or folder picker.");
      return;
    }
    setLoading(true);
    setProgress(15);
    setError(null);
    setResults(null);

    const form = new FormData();
    for (const f of files) form.append("files", f);

    const timer = window.setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 800);

    const res = await fetch(`/api/jobs/${jobId}/bulk-resumes`, {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });

    window.clearInterval(timer);
    setProgress(100);

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Bulk upload failed.");
      setProgress(0);
      return;
    }

    const rows = Array.isArray(data.results) ? (data.results as BulkResult[]) : [];
    setResults(rows);
    setTimeout(() => setProgress(0), 600);
    router.refresh();
  }

  const created =
    results?.filter((r): r is BulkImportResultCardData => r.status === "created") ?? [];
  const duplicates =
    results?.filter((r): r is BulkImportResultCardData => r.status === "duplicate") ?? [];
  const failed =
    results?.filter(
      (r): r is Extract<BulkResult, { status: "failed" }> => r.status === "failed"
    ) ?? [];
  const canImport = files.length > 0 && !loading;

  return (
    <div className="space-y-5">
      <input
        ref={folderInputRef}
        type="file"
        className="sr-only"
        onChange={onFolderPick}
        disabled={loading}
      />

      <FileDropZone
        disabled={loading}
        label="Drop resumes here"
        sublabel="PDF or DOCX — we'll screen each file against this role and rank applicants below."
        hint="Tip: use Choose folder for a full batch in Chrome or Edge"
        onFiles={setPickedFiles}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={loading} onClick={openFolderPicker}>
          <FolderOpen className="h-4 w-4" />
          Choose folder
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() =>
            document.getElementById(`bulk-files-${jobId}`)?.click()
          }
        >
          <Files className="h-4 w-4" />
          Choose files
        </Button>
        <input
          id={`bulk-files-${jobId}`}
          type="file"
          className="sr-only"
          multiple
          disabled={loading}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            setPickedFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <p className="text-sm text-foreground">
          <span className="font-semibold">{files.length}</span> resume
          {files.length !== 1 ? "s" : ""} ready
          {skippedCount > 0 && (
            <span className="text-muted"> · {skippedCount} other file(s) skipped</span>
          )}
        </p>
      )}

      {loading && progress > 0 && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Screening resumes…</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-hr">
            <div className="progress-hr__bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Button type="button" onClick={upload} disabled={!canImport} className="shadow-sm">
        {loading
          ? "Screening…"
          : files.length > 0
            ? `Screen ${files.length} resume${files.length !== 1 ? "s" : ""}`
            : "Screen resumes"}
      </Button>

      {error && <p className="text-sm text-risk">{error}</p>}

      {results && created.length > 0 && (
        <div className="rounded-xl border border-success/25 bg-success-bg/40 px-4 py-3">
          <p className="text-sm font-semibold text-success">
            {created.length} applicant{created.length !== 1 ? "s" : ""} screened — see ranked
            pipeline below
          </p>
          <a
            href="#job-pipeline"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Jump to pipeline
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">
            Imported {created.length} · Skipped {duplicates.length} duplicate
            {duplicates.length !== 1 ? "s" : ""} · Failed {failed.length}
          </p>

          {(created.length > 0 || duplicates.length > 0) && (
            <div className="grid gap-2 sm:grid-cols-2">
              {[...created, ...duplicates].map((row) => (
                <BulkImportResultCard key={`${row.applicationId}-${row.fileName}`} row={row} />
              ))}
            </div>
          )}

          {failed.length > 0 && (
            <div className="rounded-lg border border-risk/20 bg-risk-bg/30 p-3">
              <p className="text-xs font-semibold text-risk">Could not import</p>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {failed.map((r) => (
                  <li key={r.fileName}>
                    <span className="font-medium text-foreground">{r.fileName}</span> — {r.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
