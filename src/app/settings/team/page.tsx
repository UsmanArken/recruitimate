"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Role = { id: string; code: string; name: string };
type Invite = {
  id: string;
  email: string;
  expiresAt: string;
  role: { name: string; code: string };
};

export default function TeamSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("RECRUITER");
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((data) => {
        setRoles(data.filter((r: Role) => r.code !== "ORG_OWNER"));
      });
    loadInvites();
  }, []);

  function loadInvites() {
    fetch("/api/invites")
      .then((r) => r.json())
      .then(setInvites)
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

  return (
    <>
      <PageHeader
        title="Team & access"
        description="Invite colleagues. Roles and permissions are enforced from database ACL rules."
      />
      <PageBody className="max-w-2xl space-y-6">
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

        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending invites</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {invites.map((inv) => (
                  <li key={inv.id} className="flex justify-between border-b border-border-subtle py-2">
                    <span>
                      {inv.email} · {inv.role.name}
                    </span>
                    <span className="text-muted">
                      expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </span>
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
