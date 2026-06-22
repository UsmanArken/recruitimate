"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database, Loader2, Plus, RefreshCw, Upload } from "lucide-react";
import type { TalentDiscoveryIngestResult } from "@/lib/intelligence/types";

type PoolRow = {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number };
};

export function TalentDiscoveryPanel() {
  const [pools, setPools] = useState<PoolRow[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [poolName, setPoolName] = useState("");
  const [poolDescription, setPoolDescription] = useState("");
  const [creatingPool, setCreatingPool] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [linkedInText, setLinkedInText] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastIngest, setLastIngest] = useState<TalentDiscoveryIngestResult | null>(null);
  const [reindexResult, setReindexResult] = useState<{ indexed: number; total: number } | null>(
    null
  );

  const loadPools = useCallback(async () => {
    setLoadingPools(true);
    try {
      const res = await fetch("/api/talent/pools", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.pools)) {
        setPools(data.pools);
      }
    } finally {
      setLoadingPools(false);
    }
  }, []);

  useEffect(() => {
    void loadPools();
  }, [loadPools]);

  async function createPool() {
    if (!poolName.trim()) return;
    setCreatingPool(true);
    setError(null);
    try {
      const res = await fetch("/api/talent/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: poolName.trim(),
          description: poolDescription.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create pool");
        return;
      }
      setPoolName("");
      setPoolDescription("");
      await loadPools();
    } finally {
      setCreatingPool(false);
    }
  }

  async function ingest() {
    if (!name.trim() || resumeText.trim().length + linkedInText.trim().length < 20) {
      setError("Name and at least 20 characters of resume or LinkedIn text are required.");
      return;
    }
    setIngesting(true);
    setError(null);
    setLastIngest(null);
    try {
      const res = await fetch("/api/talent/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          resumeText: resumeText.trim() || undefined,
          linkedInText: linkedInText.trim() || undefined,
          source: "manual",
          poolId: selectedPoolId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Ingest failed");
        return;
      }
      setLastIngest(data as TalentDiscoveryIngestResult);
      setName("");
      setEmail("");
      setResumeText("");
      setLinkedInText("");
      await loadPools();
    } finally {
      setIngesting(false);
    }
  }

  async function reindex() {
    setReindexing(true);
    setError(null);
    setReindexResult(null);
    try {
      const res = await fetch("/api/talent/reindex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ poolId: selectedPoolId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Reindex failed");
        return;
      }
      setReindexResult(data as { indexed: number; total: number });
    } finally {
      setReindexing(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-primary/20 bg-card p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Database className="h-4 w-4 text-primary" />
            Talent discovery corpus
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              P2-009
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted">
            Build searchable talent pools from resumes, LinkedIn, bulk import, and external sources.
            Only aggregated profile text is indexed — no raw video or frames.
          </p>
        </div>
        <Button type="button" variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => void reindex()} disabled={reindexing}>
          {reindexing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Reindex
        </Button>
      </div>

      {reindexResult && (
        <p className="mb-3 text-xs text-success">
          Reindexed {reindexResult.indexed} of {reindexResult.total} candidates.
        </p>
      )}

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Talent pools</p>
          {loadingPools ? (
            <p className="text-xs text-muted">Loading pools…</p>
          ) : pools.length === 0 ? (
            <p className="text-xs text-muted">No pools yet — create one to group sourced talent.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {pools.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted">{p._count.members} members</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 space-y-2">
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="New pool name"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Description (optional)"
              value={poolDescription}
              onChange={(e) => setPoolDescription(e.target.value)}
            />
            <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void createPool()} disabled={creatingPool}>
              {creatingPool ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create pool
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase text-muted">Ingest profile</p>
          <div className="space-y-2">
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={selectedPoolId}
              onChange={(e) => setSelectedPoolId(e.target.value)}
            >
              <option value="">All org talent (no pool)</option>
              {pools.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Candidate name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Resume text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <textarea
              className="min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="LinkedIn profile text (optional)"
              value={linkedInText}
              onChange={(e) => setLinkedInText(e.target.value)}
            />
            <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void ingest()} disabled={ingesting}>
              {ingesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Ingest to corpus
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-risk">{error}</p>}
      {lastIngest && (
        <p className="text-xs text-muted">
          Indexed{" "}
          <Link href={`/candidates/${lastIngest.candidateId}`} className="font-medium text-primary hover:underline">
            candidate
          </Link>
          {" — "}
          {lastIngest.explanation}
        </p>
      )}
    </section>
  );
}
