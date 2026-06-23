"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/utils";
import { Loader2, Send, Sparkles, BarChart3 } from "lucide-react";

type MessageRow = {
  id: string;
  status: string;
  subject: string;
  bodyText: string | null;
  openCount: number;
  replySnippet: string | null;
  candidate: { id: string; name: string; email: string | null };
};

type CampaignDetail = {
  id: string;
  name: string;
  status: string;
  stats: {
    total: number;
    generated: number;
    sent: number;
    opened: number;
    replied: number;
    openRate: number | null;
    replyRate: number | null;
  };
  messages: MessageRow[];
};

export function OutreachCampaignDetailPanel({ campaignId }: { campaignId: string }) {
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [poolId, setPoolId] = useState("");
  const [pools, setPools] = useState<{ id: string; name: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, poolRes] = await Promise.all([
        fetch(`/api/outreach/campaigns/${campaignId}`, { credentials: "same-origin" }),
        fetch("/api/talent/pools", { credentials: "same-origin" }),
      ]);
      const campData = await campRes.json().catch(() => ({}));
      const poolData = await poolRes.json().catch(() => ({}));
      if (campRes.ok) setCampaign(campData as CampaignDetail);
      if (poolRes.ok && Array.isArray(poolData.pools)) setPools(poolData.pools);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: "generate" | "send" | "addRecipients") {
    setBusy(action);
    setError(null);
    try {
      let res: Response;
      if (action === "generate") {
        res = await fetch(`/api/outreach/campaigns/${campaignId}/messages/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ tone: "professional" }),
        });
      } else if (action === "send") {
        res = await fetch(`/api/outreach/campaigns/${campaignId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({}),
        });
      } else {
        if (!poolId) {
          setError("Select a talent pool");
          return;
        }
        res = await fetch(`/api/outreach/campaigns/${campaignId}/recipients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ poolId }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Action failed");
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function recordEvent(messageId: string, type: "opened" | "replied") {
    setBusy(messageId);
    try {
      await fetch("/api/outreach/webhooks/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          messageId,
          type,
          snippet: type === "replied" ? "Thanks — interested in learning more." : undefined,
        }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading campaign…</p>;
  if (!campaign) return <p className="text-sm text-risk">Campaign not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{campaign.name}</h2>
          <p className="text-xs text-muted">Status: {campaign.status}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => void runAction("generate")}
            disabled={busy !== null}
          >
            {busy === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI personalize
            <span className="rounded bg-talent-bg px-1 text-[9px] text-talent">P2-013</span>
          </Button>
          <Button
            type="button"
            className="px-3 py-1.5 text-xs"
            onClick={() => void runAction("send")}
            disabled={busy !== null}
          >
            {busy === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send campaign
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-border-subtle bg-card/50 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="h-4 w-4 text-primary" />
          Response tracking
          <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-bold uppercase text-success">
            P2-014
          </span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Recipients" value={String(campaign.stats.total)} />
          <Stat label="Sent" value={String(campaign.stats.sent)} />
          <Stat label="Opened" value={String(campaign.stats.opened)} />
          <Stat
            label="Reply rate"
            value={campaign.stats.replyRate != null ? formatScore(campaign.stats.replyRate) : "—"}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
        >
          <option value="">Add recipients from pool…</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          onClick={() => void runAction("addRecipients")}
          disabled={busy !== null}
        >
          Add recipients
        </Button>
      </div>

      {error && <p className="text-xs text-risk">{error}</p>}

      <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {campaign.messages.length === 0 ? (
          <li className="p-4 text-sm text-muted">No messages yet — add recipients from a talent pool.</li>
        ) : (
          campaign.messages.map((m) => (
            <li key={m.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/candidates/${m.candidate.id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {m.candidate.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {m.candidate.email ?? "No email"} · {m.status}
                    {m.openCount > 0 ? ` · ${m.openCount} opens` : ""}
                  </p>
                  <p className="mt-1 text-xs font-medium">{m.subject}</p>
                  {m.bodyText && (
                    <p className="mt-2 whitespace-pre-wrap text-xs text-muted">{m.bodyText.slice(0, 400)}</p>
                  )}
                  {m.replySnippet && (
                    <p className="mt-2 text-xs text-success">Reply: {m.replySnippet}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1 text-[11px]"
                    onClick={() => void recordEvent(m.id, "opened")}
                    disabled={busy !== null}
                  >
                    Mark opened
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2 py-1 text-[11px]"
                    onClick={() => void recordEvent(m.id, "replied")}
                    disabled={busy !== null}
                  >
                    Mark replied
                  </Button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-subtle p-3">
      <p className="text-[10px] font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
