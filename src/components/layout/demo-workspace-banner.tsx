"use client";

import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { isDemoUserEmail } from "@/lib/demo/constants";

export function DemoWorkspaceBanner() {
  const { data: session } = useSession();
  const email = session?.user?.email;

  if (!isDemoUserEmail(email)) return null;

  return (
    <div className="border-b border-primary/15 bg-primary/5 px-8 py-3 text-sm text-foreground">
      <p className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>
          <span className="font-semibold">Demo workspace</span>
          <span className="text-muted">
            {" "}
            — sample jobs, resumes, and interview intelligence. Data resets when you re-run{" "}
            <code className="rounded bg-card px-1 py-0.5 text-xs">npm run db:seed-demo</code>.
          </span>
        </span>
      </p>
    </div>
  );
}
