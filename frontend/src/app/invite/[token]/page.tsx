"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Lock, Loader2, User } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { setAuth, type AuthUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { AuthField } from "@/components/features/auth/auth-field";

type InviteInfo = {
  email: string;
  organization: { name: string };
  role: { name: string; code: string };
};

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    apiFetch<InviteInfo>(`/api/invites/${token}`)
      .then(setInvite)
      .catch(() => setFetchError("This invite link is invalid or has already been used."))
      .finally(() => setFetching(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const { access_token } = await apiFetch<{ access_token: string }>("/api/invites/accept", {
        method: "POST",
        body: JSON.stringify({
          token,
          name: fd.get("name"),
          password: fd.get("password"),
        }),
      });
      // Store token first so the /me fetch gets the auth header
      localStorage.setItem("recruitimate_token", access_token);
      const me = await apiFetch<AuthUser>("/api/auth/me");
      setAuth(access_token, me);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept invite. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Full-page loading while fetching invite
  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Invite invalid / expired / already accepted
  if (fetchError) {
    return (
      <AuthLayout
        title="Invite unavailable"
        subtitle="This invite link is no longer valid."
        footer={
          <Link href="/login" className="font-semibold text-primary transition hover:text-primary-hover hover:underline">
            Sign in to an existing workspace
          </Link>
        }
      >
        <div className="flex gap-3 rounded-xl border border-risk/20 bg-risk-bg px-4 py-3 text-sm text-risk" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{fetchError}</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join your team"
      subtitle={
        invite
          ? `You've been invited to ${invite.organization.name} as ${invite.role.name}.`
          : "Set up your account to accept the invitation."
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary transition hover:text-primary-hover hover:underline">
            Sign in instead
          </Link>
        </>
      }
    >
      {invite && (
        <p className="mb-6 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted">
          Joining as <span className="font-medium text-foreground">{invite.email}</span>
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Your name"
          name="name"
          icon={User}
          required
          autoComplete="name"
          placeholder="Jane Smith"
        />
        <AuthField
          label="Create password"
          name="password"
          type="password"
          icon={Lock}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />

        {error && (
          <div role="alert" className="flex gap-3 rounded-xl border border-risk/20 bg-risk-bg px-4 py-3 text-sm text-risk">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading || !invite} className="mt-2 h-11 w-full text-base">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining…
            </>
          ) : (
            "Accept invite"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
