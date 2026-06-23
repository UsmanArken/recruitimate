"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";

type NotificationRow = {
  id: string;
  type: string;
  status: string;
  recipientEmail: string;
  subject: string;
  createdAt: string;
};

export function EmailNotificationsPanel() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("log");
  const [enabled, setEnabled] = useState(true);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/notifications", { credentials: "same-origin" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Could not load notifications");
          return;
        }
        setProvider(data.provider ?? "log");
        setEnabled(Boolean(data.enabled));
        setRows(data.notifications ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading notification log…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Bell className="h-4 w-4 text-primary" />
        <span>
          Provider: <strong className="text-foreground">{provider}</strong>
        </span>
        <span>·</span>
        <span>{enabled ? "Enabled" : "Disabled via NOTIFICATIONS_ENABLED"}</span>
      </div>

      {error && <p className="text-sm text-risk">{error}</p>}

      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          No notifications yet. Stage changes and interview analysis will appear here.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
          {rows.map((row) => (
            <li key={row.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{row.subject}</p>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-semibold uppercase text-muted ring-1 ring-border">
                  {row.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {row.type.replace(/_/g, " ").toLowerCase()} → {row.recipientEmail} ·{" "}
                {new Date(row.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
