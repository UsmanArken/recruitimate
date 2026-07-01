"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";

type Props = {
  organizationId: string;
  organizationName: string;
  isImpersonating: boolean;
};

export function TenantAdminActions({
  organizationId,
  organizationName,
  isImpersonating,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startImpersonation() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      if (!res.ok) return;
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function stopImpersonation() {
    setLoading(true);
    try {
      await fetch("/api/admin/impersonate", {
        method: "DELETE",
        credentials: "same-origin",
      });
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (isImpersonating) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={stopImpersonation}
        className="inline-flex items-center gap-1.5 rounded-md border border-amber-900/20 px-2.5 py-1 text-xs font-semibold text-amber-950 transition hover:bg-amber-900/10 disabled:opacity-60"
        title={`Stop impersonating ${organizationName}`}
      >
        <LogOut className="h-3.5 w-3.5" />
        Exit
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={startImpersonation}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-60"
      title={`Impersonate ${organizationName}`}
    >
      <LogIn className="h-3.5 w-3.5" />
      Impersonate
    </button>
  );
}
