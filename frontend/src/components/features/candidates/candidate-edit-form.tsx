"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X, Loader2, Lock } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { getStoredUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface Props {
  candidateId: string;
  initialName: string;
  initialEmail: string | null;
  source: "portal" | "manual";
}

const CAN_EDIT_EMAIL_ROLES = ["RECRUITER", "ORG_ADMIN", "ORG_OWNER"];
const CAN_EDIT_NAME_ROLES = ["HIRING_MANAGER", "RECRUITER", "ORG_ADMIN", "ORG_OWNER"];

export function CandidateEditForm({ candidateId, initialName, initialEmail, source }: Props) {
  const router = useRouter();
  const currentUser = getStoredUser();
  const roleCode = currentUser?.roleCode ?? "";

  const canEditName = CAN_EDIT_NAME_ROLES.includes(roleCode);
  const canEditEmail = CAN_EDIT_EMAIL_ROLES.includes(roleCode);

  // Nothing to show if role has no edit permissions at all
  if (!canEditName) return null;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName(initialName);
    setEmail(initialEmail ?? "");
    setError(null);
    setOpen(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string | null> = { name: name.trim() };
      if (canEditEmail) body.email = email.trim() || null;
      await apiFetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
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
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-muted transition hover:bg-muted/40 hover:text-foreground"
        title="Edit candidate"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    );
  }

  return (
    <div className="mt-3 w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-sm">
      <form onSubmit={save} className="space-y-3">

        <label className="block">
          <span className="text-xs font-semibold text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-hr mt-1"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Email</span>
          {canEditEmail ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="input-hr mt-1"
              />
              {source === "portal" && (
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-warning">
                  <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                  This candidate has a portal account with this email. If you change it, notify them manually — they'll need to use the new email to log in.
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted">
              {initialEmail ?? "—"}
            </p>
          )}
        </label>

        {error && (
          <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving || !name.trim()} className="h-8 px-3 text-xs">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="secondary" onClick={reset} className="h-8 px-3 text-xs">
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
