"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90_000;

export function ReanalyzeButton({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "queued" | "polling">("idle");

  async function handleClick() {
    setState("queued");
    try {
      await apiFetch(`/api/applications/${applicationId}/talent`, { method: "POST" });
    } catch {
      setState("idle");
      return;
    }

    // Task is now queued in Celery — poll until talentProfile appears or times out
    setState("polling");
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    const poll = async () => {
      if (Date.now() >= deadline) {
        setState("idle");
        router.refresh();
        return;
      }
      try {
        const app = await apiFetch<{ talentProfile: unknown }>(`/api/applications/${applicationId}`);
        if (app.talentProfile) {
          setState("idle");
          router.refresh();
          return;
        }
      } catch {
        // ignore transient errors, keep polling
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };

    setTimeout(poll, POLL_INTERVAL_MS);
  }

  const loading = state !== "idle";

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {state === "queued" ? "Queuing…" : state === "polling" ? "Analysing…" : "Re-run screening"}
    </Button>
  );
}
