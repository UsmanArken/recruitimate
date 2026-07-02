"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import type { RoleSparkDraft } from "@/lib/validators/role-spark";

type RoleSparkPanelProps = {
  title: string;
  disabled?: boolean;
  onGenerated: (draft: RoleSparkDraft) => void;
  onError: (message: string) => void;
};

export function RoleSparkPanel({
  title,
  disabled,
  onGenerated,
  onError,
}: RoleSparkPanelProps) {
  const [keywords, setKeywords] = useState("");
  const [seniority, setSeniority] = useState("");
  const [location, setLocation] = useState("");
  const [workModel, setWorkModel] = useState("");
  const [teamContext, setTeamContext] = useState("");
  const [loading, setLoading] = useState(false);

  async function spark() {
    if (!title.trim()) {
      onError("Enter a job title above first.");
      return;
    }
    if (keywords.trim().length < 3) {
      onError("Add a few keywords — skills, stack, or domain.");
      return;
    }

    setLoading(true);
    onError("");

    const res = await fetch("/api/jobs/role-spark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title: title.trim(),
        keywords: keywords.trim(),
        ...(seniority ? { seniority } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
        ...(workModel ? { workModel } : {}),
        ...(teamContext.trim() ? { teamContext: teamContext.trim() } : {}),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(typeof data.error === "string" ? data.error : "Role Spark could not generate a draft");
      return;
    }

    const draft = (await res.json()) as RoleSparkDraft;
    onGenerated(draft);
  }

  return (
    <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Zap className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">Role Spark</p>
          <p className="mt-0.5 text-sm text-muted">
            Flash a title and a few signals into a full job description — no client profile
            required.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="text-sm font-semibold">Keywords & signals</span>
          <input
            className="input-hr mt-1.5"
            placeholder="e.g. Python, AWS, fintech, stakeholder management, remote EU"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={disabled || loading}
          />
          <p className="mt-1 text-xs text-muted">
            Comma-separated skills, stack, industry, or must-haves — Recruitimate turns them into
            post-ready copy.
          </p>
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Seniority
            </span>
            <select
              className="input-hr mt-1 py-2 text-sm"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
              disabled={disabled || loading}
            >
              <option value="">Any</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-level</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead / Staff</option>
              <option value="DIRECTOR">Director</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Work model
            </span>
            <select
              className="input-hr mt-1 py-2 text-sm"
              value={workModel}
              onChange={(e) => setWorkModel(e.target.value)}
              disabled={disabled || loading}
            >
              <option value="">Any</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Location
            </span>
            <input
              className="input-hr mt-1 py-2 text-sm"
              placeholder="e.g. London, UK"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={disabled || loading}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">Team context (optional)</span>
          <input
            className="input-hr mt-1.5"
            placeholder="e.g. First hire on a 6-person platform team reporting to the CTO"
            value={teamContext}
            onChange={(e) => setTeamContext(e.target.value)}
            disabled={disabled || loading}
          />
        </label>

        <Button
          type="button"
          disabled={disabled || loading || !title.trim()}
          onClick={() => void spark()}
        >
          <Zap className="h-4 w-4" />
          {loading ? "Sparking…" : "Spark my job description"}
        </Button>
      </div>
    </div>
  );
}
