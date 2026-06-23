"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Role = { id: string; code: string; name: string };
type RoleWithPermissions = Role & {
  permissions: { permission: { code: string; description: string | null } }[];
};
type Member = {
  id: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  role: { id: string; code: string; name: string };
};
type Invite = {
  id: string;
  email: string;
  expiresAt: string;
  role: { name: string; code: string };
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ORG_OWNER: "Full access including billing and member role changes.",
  ORG_ADMIN: "Manage jobs, candidates, team invites, and most settings.",
  RECRUITER: "Run pipeline, screen candidates, and schedule interviews.",
  HIRING_MANAGER: "Own hiring decisions on assigned roles; read pipeline.",
};

export default function TeamSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesWithPermissions, setRolesWithPermissions] = useState<RoleWithPermissions[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("RECRUITER");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((data) => {
        setRoles(data.filter((r: Role) => r.code !== "ORG_OWNER"));
      });
    fetch("/api/roles/permissions")
      .then((r) => r.json())
      .then(setRolesWithPermissions)
      .catch(() => {});
    loadMembers();
    loadInvites();
  }, []);

  function loadMembers() {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => {});
  }

  function loadInvites() {
    fetch("/api/invites")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInvites(data);
      })
      .catch(() => {});
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInviteLink(null);

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, roleCode }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to send invite");
      return;
    }

    const link = `${window.location.origin}/invite/${data.token}`;
    setInviteLink(link);
    setEmail("");
    loadInvites();
  }

  async function updateMemberRole(memberId: string, nextRoleCode: string) {
    setUpdatingMemberId(memberId);
    setRoleUpdateError(null);

    const res = await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleCode: nextRoleCode }),
    });

    const data = await res.json();
    setUpdatingMemberId(null);

    if (!res.ok) {
      setRoleUpdateError(data.error ?? "Failed to update role");
      return;
    }

    loadMembers();
  }

  const assignableRoles = rolesWithPermissions.length > 0 ? rolesWithPermissions : roles;

  return (
    <>
      <PageHeader
        title="Team & access"
        description="Manage teammates, invites, and role-based permissions (RBAC)."
      />
      <PageBody className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team members</CardTitle>
            <CardDescription>
              Everyone in your organization. Assign roles to control what each person can do.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted">
                      No teammates yet — you are the only member. Invite colleagues below.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="border-b border-border-subtle">
                      <td className="py-3 pr-4 font-medium">{member.user.name}</td>
                      <td className="py-3 pr-4 text-muted">{member.user.email}</td>
                      <td className="py-3 pr-4">
                        {member.role.code === "ORG_OWNER" ? (
                          <span className="font-medium">{member.role.name}</span>
                        ) : (
                          <select
                            value={member.role.code}
                            disabled={updatingMemberId === member.id}
                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                            className="input-hr py-1.5 text-sm"
                          >
                            {assignableRoles
                              .filter((r) => r.code !== "ORG_OWNER")
                              .map((r) => (
                                <option key={r.code} value={r.code}>
                                  {r.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="py-3 text-muted">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {roleUpdateError && (
              <p className="mt-3 rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">
                {roleUpdateError}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles & permissions (RBAC)</CardTitle>
            <CardDescription>
              Permissions are enforced server-side per role. Job interviewers are assigned per open
              role on each job&apos;s detail page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rolesWithPermissions.length > 0
              ? rolesWithPermissions.map((role) => (
                  <div key={role.code} className="rounded-lg border border-border-subtle p-4">
                    <p className="font-semibold">{role.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {ROLE_DESCRIPTIONS[role.code] ?? "Organization-scoped access."}
                    </p>
                    {role.permissions.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {role.permissions.map((rp) => (
                          <li
                            key={rp.permission.code}
                            className="rounded-md bg-muted/10 px-2 py-0.5 text-xs text-muted"
                            title={rp.permission.description ?? undefined}
                          >
                            {rp.permission.code}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              : roles.map((role) => (
                  <div key={role.code} className="rounded-lg border border-border-subtle p-4">
                    <p className="font-semibold">{role.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {ROLE_DESCRIPTIONS[role.code] ?? "Organization-scoped access."}
                    </p>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invite teammate</CardTitle>
            <CardDescription>
              New members join with the role you select. Owners can change roles later in the table
              above.
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
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  className="input-hr mt-1.5"
                >
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
              )}
              {inviteLink && (
                <div className="rounded-lg bg-success-bg/50 p-3 text-sm">
                  <p className="font-semibold text-success">Invite link (share securely):</p>
                  <p className="mt-1 break-all text-foreground">{inviteLink}</p>
                </div>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Sending…" : "Create invite"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
            <CardDescription>Outstanding invitations that have not been accepted yet.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Role</th>
                  <th className="pb-2">Expires</th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-muted">
                      No pending invites.
                    </td>
                  </tr>
                ) : (
                  invites.map((inv) => (
                    <tr key={inv.id} className="border-b border-border-subtle">
                      <td className="py-3 pr-4">{inv.email}</td>
                      <td className="py-3 pr-4">{inv.role.name}</td>
                      <td className="py-3 text-muted">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
