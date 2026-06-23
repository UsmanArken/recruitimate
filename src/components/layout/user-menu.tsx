"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Building2, LogOut, Plug, Users } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();

  return (
    <div className="border-t border-white/10 p-4">
      {session?.user && (
        <div className="mb-3 px-2">
          <p className="truncate text-xs font-semibold text-white">{session.user.name}</p>
          <p className="truncate text-[10px] text-brand-foreground/50">
            {session.user.isPlatformAdmin
              ? "platform super admin"
              : session.user.roleCode?.replace(/_/g, " ").toLowerCase()}
          </p>
        </div>
      )}
      <Link
        href="/settings/clients"
        className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-foreground/80 hover:bg-white/8"
      >
        <Building2 className="h-4 w-4" />
        Client companies
      </Link>
      <Link
        href="/settings/integrations"
        className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-foreground/80 hover:bg-white/8"
      >
        <Plug className="h-4 w-4" />
        Integrations
      </Link>
      <Link
        href="/settings/team"
        className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-foreground/80 hover:bg-white/8"
      >
        <Users className="h-4 w-4" />
        Team & invites
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-foreground/80 hover:bg-white/8"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
