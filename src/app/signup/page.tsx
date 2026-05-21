"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Building2, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/features/auth/auth-layout";
import { AuthField } from "@/components/features/auth/auth-field";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        organizationName: fd.get("organizationName"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Signup failed");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (signInRes?.error) {
      setError("Account created but sign-in failed. Try logging in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start hiring with intelligence—your organization, your pipeline, full owner access."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary transition hover:text-primary-hover hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthField label="Your name" name="name" icon={User} required autoComplete="name" />
        <AuthField
          label="Work email"
          name="email"
          type="email"
          icon={Mail}
          required
          autoComplete="email"
        />
        <AuthField
          label="Password"
          name="password"
          type="password"
          icon={Lock}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <AuthField
          label="Organization name"
          name="organizationName"
          icon={Building2}
          required
          placeholder="Acme Talent Team"
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
              Creating workspace…
            </>
          ) : (
            "Create workspace"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
