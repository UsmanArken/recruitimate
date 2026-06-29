"use client";

import { useAuth, useSession } from "@/components/providers/auth-provider";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const { signOut } = useAuth();

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
      <button
        type="button"
        onClick={signOut}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-foreground/80 hover:bg-white/8"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
