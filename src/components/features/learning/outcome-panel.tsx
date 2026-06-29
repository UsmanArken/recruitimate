"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrew" },
  { value: "OFFER_DECLINED", label: "Offer declined" },
] as const;

const ONBOARDING_OPTIONS = [
  { value: "PENDING", label: "Pending / too early" },
  { value: "SUCCESSFUL", label: "Successful" },
  { value: "STRUGGLING", label: "Struggling" },
  { value: "LEFT", label: "Left the role" },
] as const;

export type OutcomeData = {
  status: string;
  onboardingStatus: string;
  notes: string | null;
  recordedAt: string;
  recordedBy: { name: string | null; email: string } | null;
} | null;

const selectClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export function OutcomePanel({
  applicationId,
  initialOutcome,
}: {
  applicationId: string;
  initialOutcome: OutcomeData;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialOutcome?.status ?? "HIRED");
  const [onboardingStatus, setOnboardingStatus] = useState(
    initialOutcome?.onboardingStatus ?? "PENDING"
  );
  const [notes, setNotes] = useState(initialOutcome?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showOnboarding = status === "HIRED";

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/applications/${applicationId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          onboardingStatus: showOnboarding ? onboardingStatus : "PENDING",
          notes: notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to record outcome");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record outcome");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Final outcome
          </span>
          <select
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {showOnboarding && (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Onboarding result
            </span>
            <select
              className={selectClass}
              value={onboardingStatus}
              onChange={(e) => setOnboardingStatus(e.target.value)}
            >
              {ONBOARDING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Notes (optional)
        </span>
        <textarea
          className={`${selectClass} min-h-[72px] resize-y`}
          placeholder="Context on the decision, ramp-up, or reason for the outcome…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-warning">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {initialOutcome ? "Update outcome" : "Record outcome"}
        </Button>
        {saved && !saving && (
          <span className="text-sm font-medium text-success">Saved — feeds the learning engine</span>
        )}
        {initialOutcome?.recordedBy && !saved && (
          <span className="text-xs text-muted">
            Last recorded by{" "}
            {initialOutcome.recordedBy.name ?? initialOutcome.recordedBy.email}
          </span>
        )}
      </div>
    </div>
  );
}
