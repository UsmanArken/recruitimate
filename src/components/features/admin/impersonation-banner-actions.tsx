"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type ImpersonationState =
  | { active: false }
  | { active: true; organization: { id: string; name: string; slug: string } };

export function ImpersonationBannerActions() {
  const router = useRouter();
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/admin/impersonate", { credentials: "same-origin" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as ImpersonationState;
      if (!cancelled) setState(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  if (!state?.active) return null;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={stopImpersonation}
      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-900/25 bg-emerald-900/10 px-3 py-1.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-900/15 disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" />
      Exit {state.organization.name}
    </button>
  );
}
