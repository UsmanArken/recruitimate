"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

export function PlatformOperatorBanner() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user?.isPlatformAdmin) return null;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-8 py-3 text-sm text-amber-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p>
          <span className="font-semibold">Platform operator mode</span>
          <span className="text-amber-900/80">
            {" "}
            — read-only across customer workspaces. Hiring changes require tenant impersonation
            (coming soon).
          </span>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-900/10 px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-900/15"
          >
            <Shield className="h-3.5 w-3.5" />
            Platform admin
          </Link>
          <button
            type="button"
            onClick={() => {
              document.cookie =
                "recruitimate-operator-browse=; path=/; max-age=0; SameSite=Lax";
              window.location.href = "/admin";
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-amber-900/20 px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-900/10"
          >
            Exit browse mode
          </button>
        </div>
      </div>
    </div>
  );
}
