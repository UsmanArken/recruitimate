"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobOption } from "@/lib/api/jobs-client";

type JobPositionPickerProps = {
  jobs: JobOption[];
  name?: string;
  required?: boolean;
  value?: string;
  onChange?: (jobId: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Compact custom dropdown (single-line trigger + scrollable menu).
 * Replaces native &lt;select&gt; where OS/Tailwind breaks the native picker.
 */
export function JobPositionPicker({
  jobs,
  name = "jobId",
  required = true,
  value,
  onChange,
  placeholder = "Select requisition…",
  className,
}: JobPositionPickerProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const controlled = onChange !== undefined;

  const [internalId, setInternalId] = useState("");
  const [open, setOpen] = useState(false);

  const selectedId = controlled ? (value ?? "") : internalId;
  const selectedJob = jobs.find((j) => j.id === selectedId);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pick(jobId: string) {
    if (!controlled) setInternalId(jobId);
    onChange?.(jobId);
    setOpen(false);
  }

  if (jobs.length === 0) return null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {!controlled && name ? (
        <input type="hidden" name={name} value={selectedId} readOnly />
      ) : null}

      <button
        type="button"
        id={`${listboxId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-required={required}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "input-hr flex w-full items-center justify-between gap-2 text-left",
          !selectedJob && "text-muted"
        )}
      >
        <span className="truncate">{selectedJob?.title ?? placeholder}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={`${listboxId}-trigger`}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {jobs.map((job) => {
            const active = job.id === selectedId;
            return (
              <li key={job.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(job.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition",
                    "hover:bg-primary/5",
                    active && "bg-primary/8 font-semibold text-primary"
                  )}
                >
                  <span className="truncate">{job.title}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
