"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropZone({
  onFiles,
  accept,
  disabled,
  hint,
  label = "Drop files here",
  sublabel,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  hint?: string;
  label?: string;
  sublabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length > 0) onFiles(files);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "drop-zone",
        dragOver && "drop-zone--active",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Upload className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sublabel && <p className="max-w-sm text-xs leading-relaxed text-muted">{sublabel}</p>}
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
