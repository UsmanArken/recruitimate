"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ParseResult = {
  text: string;
  format: string;
  fileName: string;
  characterCount: number;
};

export function ResumeUploadField({
  resumeText,
  onResumeTextChange,
  required = true,
}: {
  resumeText: string;
  onResumeTextChange: (text: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<ParseResult | null>(null);

  async function handleFile(file: File) {
    setParsing(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    setParsing(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUploadError(data.error ?? "Could not parse file");
      setUploadedFile(null);
      return;
    }

    const result: ParseResult = await res.json();
    setUploadedFile(result);
    onResumeTextChange(result.text);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function clearUpload() {
    setUploadedFile(null);
    setUploadError(null);
    onResumeTextChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">
          Resume {required && <span className="text-risk">*</span>}
        </span>
        <span className="text-xs text-muted">PDF or DOCX, max 10 MB</span>
      </div>

      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed border-border bg-background/80 p-6 transition",
          parsing && "border-primary/40 bg-interview-bg/30",
          !parsing && !uploadError && "hover:border-primary/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={parsing}
          onChange={onInputChange}
          aria-label="Upload resume PDF or DOCX"
        />
        <div className="pointer-events-none flex flex-col items-center text-center">
          {parsing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Extracting text…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Drop resume here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted">PDF and DOCX supported</p>
            </>
          )}
        </div>
      </div>

      {uploadedFile && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-success/25 bg-success-bg px-3 py-2.5">
          <div className="flex gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{uploadedFile.fileName}</p>
              <p className="text-xs text-muted">
                {uploadedFile.format.toUpperCase()} · {uploadedFile.characterCount.toLocaleString()}{" "}
                characters extracted
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearUpload}
            className="shrink-0 rounded p-1 text-muted hover:bg-card hover:text-foreground"
            aria-label="Clear uploaded resume"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadError && (
        <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{uploadError}</p>
      )}

      <label className="block">
        <span className="text-xs font-medium text-muted">
          Review or edit extracted text (or paste manually)
        </span>
        <textarea
          name="resumeText"
          required={required}
          rows={12}
          value={resumeText}
          onChange={(e) => {
            onResumeTextChange(e.target.value);
            if (uploadedFile && e.target.value !== uploadedFile.text) {
              setUploadedFile(null);
            }
          }}
          placeholder="Paste or upload a resume — talent intelligence runs on this text…"
          className="input-hr mt-1.5 font-mono text-xs leading-relaxed"
        />
      </label>
    </div>
  );
}
