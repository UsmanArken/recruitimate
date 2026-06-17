"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { setAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type InviteInfo = {
  email: string;
  organization: { name: string };
  role: { name: string; code: string };
};

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<InviteInfo>(`/api/invites/${token}`)
      .then(setInvite)
      .catch(() => setError("This invite link is invalid or expired."));
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const { access_token, user } = await apiFetch<{
        access_token: string;
        user: { id: string; email: string; name: string; organizationId: string | null; roleCode: string | null; isPlatformAdmin: boolean };
      }>("/api/invites/accept", {
        method: "POST",
        body: JSON.stringify({
          token,
          name: fd.get("name"),
          password: fd.get("password"),
        }),
      });
      setAuth(access_token, user);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept invite");
    } finally {
      setLoading(false);
    }
  }

  if (error && !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p className="text-risk">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Join your team</h1>
        {invite && (
          <p className="mt-2 text-sm text-muted">
            You&apos;re invited to <strong>{invite.organization.name}</strong> as{" "}
            <strong>{invite.role.name}</strong> ({invite.email}).
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">Your name</span>
            <input name="name" required className="input-hr mt-1.5" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Create password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="input-hr mt-1.5"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
          )}
          <Button type="submit" disabled={loading || !invite} className="w-full">
            {loading ? "Joining…" : "Accept invite"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="text-primary hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
