"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FolderOpen, Files } from "lucide-react";
import { isAllowedResumeFile } from "@/lib/resume/extract-text";
import {
  BulkImportResultCard,
  type BulkImportResultCardData,
} from "@/components/features/jobs/bulk-import-result-card";

type BulkResult =
  | BulkImportResultCardData
  | { status: "failed"; fileName: string; error: string; code?: string };

function pickResumeFiles(fileList: FileList | null): File[] {
  return Array.from(fileList ?? []).filter((f) => isAllowedResumeFile(f.name, f.type));
}

export function BulkResumeUploadPanel({ jobId }: { jobId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResult[] | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const all = Array.from(e.target.files ?? []);
    const resumes = pickResumeFiles(e.target.files);
    setFiles(resumes);
    setSkippedCount(Math.max(0, all.length - resumes.length));
    setResults(null);
    setError(
      resumes.length === 0 && all.length > 0
        ? "No PDF or DOCX files found. Only .pdf and .docx are supported."
        : null
    );
    e.target.value = "";
  }

  function openFolderPicker() {
    const el = inputRef.current;
    if (!el) return;
    el.setAttribute("multiple", "");
    el.setAttribute("webkitdirectory", "");
    el.setAttribute("directory", "");
    el.removeAttribute("accept");
    el.click();
  }

  function openFilePicker() {
    const el = inputRef.current;
    if (!el) return;
    el.removeAttribute("webkitdirectory");
    el.removeAttribute("directory");
    el.setAttribute("multiple", "");
    el.setAttribute(
      "accept",
      ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    el.click();
  }

  async function upload() {
    if (files.length === 0) {
      setError("Choose a folder or select PDF/DOCX files first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);

    const form = new FormData();
    for (const f of files) form.append("files", f);

    const res = await fetch(`/api/jobs/${jobId}/bulk-resumes`, {
      method: "POST",
      body: form,
      credentials: "same-origin",
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Bulk upload failed.");
      return;
    }

    const rows = Array.isArray(data.results) ? (data.results as BulkResult[]) : [];
    setResults(rows);
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
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Select a folder of resumes (PDF/DOCX) or pick multiple files. Each resume becomes a
        candidate for this role with talent screening. Duplicates (same email, same resume, or
        already on this role) are skipped.
      </p>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onPick}
        disabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={loading} onClick={openFolderPicker}>
          <FolderOpen className="h-4 w-4" />
          Choose folder
        </Button>
        <Button type="button" variant="secondary" disabled={loading} onClick={openFilePicker}>
          <Files className="h-4 w-4" />
          Choose files
        </Button>
      </div>

      {files.length > 0 && (
        <p className="text-sm text-foreground">
          <span className="font-semibold">{files.length}</span> resume
          {files.length !== 1 ? "s" : ""} ready to import
          {skippedCount > 0 && (
            <span className="text-muted"> · {skippedCount} other file(s) ignored</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={upload} disabled={!canImport}>
          {loading
            ? "Processing…"
            : files.length > 0
              ? `Import & screen ${files.length} resume${files.length !== 1 ? "s" : ""}`
              : "Import & screen"}
        </Button>
      </div>

      {files.length === 0 && !error && (
        <p className="text-xs text-muted">
          Use <span className="font-medium">Choose folder</span> (Chrome/Edge) or{" "}
          <span className="font-medium">Choose files</span> if folder pick is unavailable.
        </p>
      )}

      {error && <p className="text-sm text-risk">{error}</p>}

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
