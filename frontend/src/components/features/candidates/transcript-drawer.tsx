"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

function parseTranscript(raw: string | null): { speaker: string; text: string }[] {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => {
      const colon = line.indexOf(":");
      if (colon === -1) return null;
      return { speaker: line.slice(0, colon).trim(), text: line.slice(colon + 1).trim() };
    })
    .filter((s): s is { speaker: string; text: string } => s !== null && s.text.length > 0);
}

interface Props {
  transcript: string | null;
  interviewTitle?: string;
}

export function TranscriptDrawer({ transcript, interviewTitle }: Props) {
  const [open, setOpen] = useState(false);
  const segments = parseTranscript(transcript);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-background"
      >
        <MessageSquare className="h-4 w-4 text-primary" />
        View transcript
        {segments.length > 0 && (
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {segments.length}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-card shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-modal="true"
        role="dialog"
        aria-label="Interview transcript"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-sm font-bold">Transcript</p>
            {interviewTitle && (
              <p className="mt-0.5 text-xs text-muted">{interviewTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted transition hover:bg-background hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {segments.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted">No transcript recorded for this interview.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {segments.map((seg, i) => {
                const isCandidate = seg.speaker.toLowerCase() === "candidate";
                return (
                  <div
                    key={i}
                    className={cn("flex", isCandidate ? "justify-end" : "justify-start")}
                  >
                    <div className={cn("max-w-[82%]", isCandidate ? "items-end" : "items-start", "flex flex-col gap-1")}>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isCandidate ? "text-right text-primary" : "text-left text-muted"
                      )}>
                        {seg.speaker}
                      </span>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isCandidate
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm border border-border-subtle bg-background text-foreground"
                      )}>
                        {seg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
