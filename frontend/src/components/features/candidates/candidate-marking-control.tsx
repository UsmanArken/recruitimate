"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-fetch";

const MARKING_CONFIG: Record<string, { label: string; cls: string }> = {
  ACTIVE:    { label: "Active",    cls: "bg-success-bg text-success" },
  ON_HOLD:   { label: "On hold",   cls: "bg-warning-bg text-warning" },
  ARCHIVED:  { label: "Archived",  cls: "bg-border text-muted" },
};

const MARKING_VALUES = ["ACTIVE", "ON_HOLD", "ARCHIVED"] as const;
type Marking = typeof MARKING_VALUES[number];

export function CandidateMarkingControl({
  candidateId,
  initialMarking,
}: {
  candidateId: string;
  initialMarking: string;
}) {
  const [marking, setMarking] = useState<string>(initialMarking || "ACTIVE");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const config = MARKING_CONFIG[marking] ?? MARKING_CONFIG.ACTIVE;

  async function changeTo(next: Marking) {
    if (next === marking) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);
    try {
      await apiFetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        body: JSON.stringify({ marking: next }),
      });
      setMarking(next);
    } catch {
      // silently revert — no toast needed, badge shows old value
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${config.cls}`}
      >
        {saving ? "Saving…" : config.label}
        <span className="text-[10px] opacity-60">▾</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
            {MARKING_VALUES.map((m) => {
              const c = MARKING_CONFIG[m];
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => changeTo(m)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition hover:bg-muted/40 ${
                    m === marking ? "opacity-40" : ""
                  }`}
                >
                  <span className={`inline-flex rounded-full px-2 py-0.5 ${c.cls}`}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
