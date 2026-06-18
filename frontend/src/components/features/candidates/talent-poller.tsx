"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 120_000;

export function TalentPoller({ active }: { active: boolean }) {
  const router = useRouter();
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!active) return;
    startRef.current = Date.now();

    const id = setInterval(() => {
      if (Date.now() - startRef.current >= POLL_TIMEOUT_MS) {
        clearInterval(id);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [active, router]);

  if (!active) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-card px-4 py-3 text-sm text-muted shadow-sm">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      Analysing resume — results will appear automatically…
    </div>
  );
}
