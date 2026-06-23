"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/utils";
import { Loader2, Mail, Plus } from "lucide-react";

type CampaignRow = {
  id: string;
  name: string;
  status: string;
  job?: { title: string } | null;
  template?: { name: string } | null;
  _count: { messages: number };
  stats?: {
    sent: number;
    opened: number;
    replied: number;
    openRate: number | null;
    replyRate: number | null;
  };
};

type TemplateOption = { id: string; name: string };
type PoolOption = { id: string; name: string };

export function OutreachCampaignsPanel() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [pools, setPools] = useState<PoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [poolId, setPoolId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campRes, tplRes, poolRes] = await Promise.all([
        fetch("/api/outreach/campaigns", { credentials: "same-origin" }),
        fetch("/api/outreach/templates", { credentials: "same-origin" }),
        fetch("/api/talent/pools", { credentials: "same-origin" }),
      ]);
      const campData = await campRes.json().catch(() => ({}));
      const tplData = await tplRes.json().catch(() => ({}));
      const poolData = await poolRes.json().catch(() => ({}));
      if (campRes.ok && Array.isArray(campData.campaigns)) setCampaigns(campData.campaigns);
      if (tplRes.ok && Array.isArray(tplData.templates)) setTemplates(tplData.templates);
      if (poolRes.ok && Array.isArray(poolData.pools)) setPools(poolData.pools);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCampaign() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          templateId: templateId || undefined,
          poolId: poolId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create campaign");
        return;
      }

      if (poolId && data.id) {
        await fetch(`/api/outreach/campaigns/${data.id}/recipients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ poolId }),
        });
      }

      setName("");
      setTemplateId("");
      setPoolId("");
      await load();
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-primary/20 bg-card p-4">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <Mail className="h-4 w-4 text-primary" />
        Outreach campaigns
      </h3>
      <p className="mb-4 text-xs text-muted">
        Create campaigns, add recipients from talent pools, personalize, send, and track responses.
      </p>

      {loading ? (
        <p className="text-xs text-muted">Loading campaigns…</p>
      ) : campaigns.length > 0 ? (
        <ul className="mb-4 divide-y divide-border-subtle rounded-lg border border-border-subtle">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <Link href={`/outreach/${c.id}`} className="text-sm font-semibold text-primary hover:underline">
                  {c.name}
                </Link>
                <p className="text-xs text-muted">
                  {c.status} · {c._count.messages} recipients
                  {c.job?.title ? ` · ${c.job.title}` : ""}
                </p>
                {c.stats && c.stats.sent > 0 && (
                  <p className="text-[11px] text-muted">
                    {c.stats.opened} opened · {c.stats.replied} replied
                    {c.stats.openRate != null ? ` · ${formatScore(c.stats.openRate)} open rate` : ""}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-xs text-muted">No campaigns yet.</p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2"
          placeholder="Campaign name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Default template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={poolId}
          onChange={(e) => setPoolId(e.target.value)}
        >
          <option value="">No pool (add recipients later)</option>
          {pools.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        className="mt-3 px-3 py-1.5 text-xs"
        onClick={() => void createCampaign()}
        disabled={creating}
      >
        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Create campaign
      </Button>
      {error && <p className="mt-2 text-xs text-risk">{error}</p>}
    </section>
  );
}
