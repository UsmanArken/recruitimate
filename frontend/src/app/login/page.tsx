"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { AuthField } from "@/components/features/auth/auth-field";
import { useAuth } from "@/components/providers/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      await signIn(fd.get("email") as string, fd.get("password") as string);
    } catch {
      setLoading(false);
      setError("Invalid email or password. Check your credentials and try again.");
      return;
    }

    setLoading(false);
    // After signIn user is set — read from storage directly
    const { getStoredUser } = await import("@/lib/auth-client");
    const me = getStoredUser();
    const destination = me?.isPlatformAdmin
      ? "/admin"
      : callbackUrl.startsWith("/admin")
        ? "/"
        : callbackUrl;

    router.push(destination);
    router.refresh();
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your hiring workspace—candidates, roles, and intelligence in one place."
      footer={
        <>
          New team?{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary transition hover:text-primary-hover hover:underline"
          >
            Create a workspace
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Work email"
          name="email"
          type="email"
          icon={Mail}
          required
          autoComplete="email"
          placeholder="you@company.com"
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

      <p className="mt-6 border-t border-border-subtle pt-6 text-center text-xs leading-relaxed text-muted">
        By signing in you agree to use Recruitimate as an advisory tool—final hiring
        decisions remain with your team.
      </p>
    </AuthLayout>
  );
}

function LoginFallback() {
  return (
    <div className="app-canvas flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
