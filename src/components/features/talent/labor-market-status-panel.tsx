"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe2, Loader2 } from "lucide-react";

export function LaborMarketStatusPanel() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("mock");
  const [httpConfigured, setHttpConfigured] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/labor-market/status", { credentials: "same-origin" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setProvider(data.provider ?? "mock");
          setHttpConfigured(Boolean(data.httpConfigured));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking labor market provider…
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-primary" />
        <span>
          Active provider: <strong className="text-foreground">{provider}</strong>
        </span>
        {provider === "http" && (
          <span className="text-xs text-muted">
            ({httpConfigured ? "API configured" : "fallback to mock when API unavailable"})
          </span>
        )}
      </div>
      <p className="text-xs text-muted">
        Open any <Link href="/jobs" className="font-medium text-primary hover:underline">open role</Link>{" "}
        and use <strong>Scan labor market</strong> under Passive market signals to fetch passive
        candidate leads for that requisition.
      </p>
      <p className="text-xs text-muted">
        Set <code className="rounded bg-background px-1">LABOR_MARKET_PROVIDER=http</code> and{" "}
        <code className="rounded bg-background px-1">LABOR_MARKET_API_URL</code> in production to
        connect a real labor market API.
      </p>
    </div>
  );
}
