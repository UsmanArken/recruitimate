"use client";

import { useRouter } from "next/navigation";
import { clearCandidateAuth } from "@/lib/candidate-auth-client";

export function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
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
