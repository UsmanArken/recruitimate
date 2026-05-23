"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, X, Mic2, Briefcase } from "lucide-react";

type Assignment = {
  id: string;
  assignmentRole: "INTERVIEWER" | "HIRING_MANAGER";
  user: { id: string; name: string | null; email: string };
};

type Member = {
  user: { id: string; name: string | null; email: string };
  role: { code: string; name: string };
};

export function JobAssignmentsPanel({
  jobId,
  readOnly = false,
}: {
  jobId: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState("");
  const [assignmentRole, setAssignmentRole] = useState<"INTERVIEWER" | "HIRING_MANAGER">(
    "INTERVIEWER"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/jobs/${jobId}/assignments`);
    if (!res.ok) return;
    const data = await res.json();
    setAssignments(data.job.assignments ?? []);
    setMembers(data.members ?? []);
    setCanManage(!readOnly && Boolean(data.canManage));
  }, [jobId, readOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/jobs/${jobId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, assignmentRole }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not assign");
      return;
    }
    setUserId("");
    await load();
    router.refresh();
  }

  async function handleRemove(assignmentId: string) {
    setError(null);
    const res = await fetch(`/api/jobs/${jobId}/assignments/${assignmentId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not remove");
      return;
    }
    await load();
    router.refresh();
  }

  const roleLabel = (role: string) =>
    role === "INTERVIEWER" ? "Interviewer" : "Hiring manager";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Assign interviewers for this requisition. They receive job-scoped access from database
        ACL rules, including the full decision intelligence layer.
      </p>

      {assignments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted">
          No one assigned yet. Add an interviewer or hiring manager below.
        </p>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    a.assignmentRole === "INTERVIEWER"
                      ? "bg-interview-bg text-interview"
                      : "bg-brand/10 text-brand"
                  }`}
                >
                  {a.assignmentRole === "INTERVIEWER" ? (
                    <Mic2 className="h-4 w-4" />
                  ) : (
                    <Briefcase className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{a.user.name ?? a.user.email}</p>
                  <p className="text-xs text-muted">{roleLabel(a.assignmentRole)}</p>
                </div>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleRemove(a.id)}
                  className="shrink-0 rounded p-1 text-muted hover:bg-risk-bg hover:text-risk"
                  aria-label="Remove assignment"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={handleAssign} className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
          <p className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Assign teammate
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Team member
              </span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="input-hr mt-1"
              >
                <option value="">Select…</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name ?? m.user.email} ({m.role.name})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Role on this job
              </span>
              <select
                value={assignmentRole}
                onChange={(e) =>
                  setAssignmentRole(e.target.value as "INTERVIEWER" | "HIRING_MANAGER")
                }
                className="input-hr mt-1"
              >
                <option value="INTERVIEWER">Interviewer</option>
                <option value="HIRING_MANAGER">Hiring manager</option>
              </select>
            </label>
          </div>
          {error && (
            <p className="text-sm text-risk">{error}</p>
          )}
          <Button type="submit" disabled={loading || !userId}>
            {loading ? "Assigning…" : "Assign to job"}
          </Button>
        </form>
      )}
    </div>
  );
}
