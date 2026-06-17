"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { AuthField } from "@/components/features/auth/auth-field";
import { setCandidateAuth, type CandidateUser } from "@/lib/candidate-auth-client";

function CandidateLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/candidate/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/candidate/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          password: fd.get("password"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(body.detail ?? "Login failed");
      }

      const data = await res.json();
      setCandidateAuth(data.access_token, data.candidate as CandidateUser);
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to check your application status and manage your profile."
      footer={<span className="text-muted">Check your email for your application link.</span>}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />

        {error && (
          <div
            role="alert"
            className="flex gap-3 rounded-xl border border-risk/20 bg-risk-bg px-4 py-3 text-sm text-risk"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="mt-2 h-11 w-full text-base">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function CandidateLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <CandidateLoginForm />
    </Suspense>
  );
}
