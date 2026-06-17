"use client";

import { useRouter } from "next/navigation";
import { clearCandidateAuth } from "@/lib/candidate-auth-client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/candidate/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Proceed with local logout even if server call fails
    }
    clearCandidateAuth();
    router.push("/candidate/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-muted transition hover:text-foreground"
    >
      Sign out
    </button>
  );
}
