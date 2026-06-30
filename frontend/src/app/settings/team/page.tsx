"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { getStoredUser } from "@/lib/auth-client";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Role = { id: string; code: string; name: string };
type Invite = {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  role: { name: string; code: string };
};
type Member = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  role: { id: string; name: string; code: string };
};

const ADMIN_ROLES = ["ORG_OWNER", "ORG_ADMIN"];

export default function TeamSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [newInviteToken, setNewInviteToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  function inviteUrl(token: string) {
    return `${window.location.origin}/invite/${token}`;
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(inviteUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  const currentUser = mounted ? getStoredUser() : null;
  const isAdmin = ADMIN_ROLES.includes(currentUser?.roleCode ?? "");
  const currentUserId = currentUser?.id;

  useEffect(() => {
    setMounted(true);
    apiFetch<Role[]>("/api/roles")
      .then((data) => {
        const filtered = data.filter((r) => r.code !== "ORG_OWNER");
        setRoles(filtered);
        if (filtered.length > 0) setRoleId(filtered[0].id);
      })
      .catch(() => {});
    loadInvites();
    loadMembers();
  }, []);

  function loadInvites() {
    apiFetch<Invite[]>("/api/invites")
      .then(setInvites)
      .catch(() => {});
  }

  function loadMembers() {
    apiFetch<Member[]>("/api/invites/members")
      .then(setMembers)
      .catch(() => {});
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNewInviteToken(null);

    try {
      const data = await apiFetch<{ token: string }>("/api/invites", {
        method: "POST",
        body: JSON.stringify({ email, roleId }),
      });
      setNewInviteToken(data.token);
      setEmail("");
      loadInvites();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(memberId: string, newRoleId: string) {
    setMemberError(null);
    try {
      const updated = await apiFetch<Member>(`/api/invites/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ roleId: newRoleId }),
      });
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    } catch (err) {
      setMemberError(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from your organization?")) return;
    setMemberError(null);
    try {
      await apiFetch(`/api/invites/members/${memberId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setMemberError(err instanceof ApiError ? err.message : "Failed to remove member");
    }
  }

  return (
    <>
      <PageHeader
        title="Team & access"
        description="Invite colleagues. Roles and permissions are enforced from database ACL rules."
      />
      <PageBody className="max-w-2xl space-y-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Invite teammate</CardTitle>
              <CardDescription>
                Organization roles: Admin, Recruiter, Hiring Manager. Interviewers are assigned per
                job on each role&apos;s detail page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendInvite} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-hr mt-1.5"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Role</span>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    className="input-hr mt-1.5"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
                {error && (
                  <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
                )}
                {newInviteToken && (
                  <div className="rounded-lg border border-success/20 bg-success-bg/40 p-3">
                    <p className="mb-2 text-xs font-semibold text-success">
                      Invite created — share this link with the recipient:
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                      <code className="min-w-0 flex-1 truncate text-xs text-foreground">
                        {inviteUrl(newInviteToken)}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyLink(newInviteToken)}
                        className="shrink-0 rounded p-1 text-muted transition hover:text-foreground"
                        title="Copy invite link"
                      >
                        {copiedToken === newInviteToken
                          ? <Check className="h-3.5 w-3.5 text-success" />
                          : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Create invite"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {members.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
            </CardHeader>
            <CardContent>
              {memberError && (
                <p className="mb-3 rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{memberError}</p>
              )}
              <ul className="space-y-2 text-sm">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-4 border-b border-border-subtle py-2 last:border-0"
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{m.name}</span>
                      <span className="text-muted truncate">{m.email}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {isAdmin && m.id !== currentUserId ? (
                        <>
                          <select
                            value={m.role.id}
                            onChange={(e) => changeRole(m.id, e.target.value)}
                            className="input-hr py-1 text-xs"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeMember(m.id)}
                            className="text-risk hover:text-risk/80 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-right flex flex-col items-end">
                          <span className="font-medium">{m.role.name}</span>
                          <span className="text-muted">
                            joined {new Date(m.joinedAt).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending invites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {invites.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 border-b border-border-subtle py-2.5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{inv.email}</p>
                      <p className="text-xs text-muted">
                        {inv.role.name} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyLink(inv.token)}
                      title="Copy invite link"
                      className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-muted/40 hover:text-foreground"
                    >
                      {copiedToken === inv.token
                        ? <><Check className="h-3.5 w-3.5 text-success" /> Copied</>
                        : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </PageBody>
    </>
  );
}
