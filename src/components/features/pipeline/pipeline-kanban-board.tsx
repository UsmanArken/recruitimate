"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PIPELINE_STAGES } from "@/lib/pipeline/stages";
import { formatScore, scoreColor } from "@/lib/utils";
import { StageBadge } from "@/components/features/candidates/stage-badge";

export type PipelineCard = {
  id: string;
  stage: string;
  candidateId: string;
  jobId: string;
  candidate: { id: string; name: string; email: string | null };
  job: { id: string; title: string };
  talentProfile: { roleFitScore: number | null } | null;
  decision: { hireConfidence: number | null; recommendation: string | null } | null;
};

type JobOption = { id: string; title: string };

export function PipelineKanbanBoard({
  initialCards,
  jobs,
  readOnly = false,
}: {
  initialCards: PipelineCard[];
  jobs: JobOption[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [jobId, setJobId] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropStage, setDropStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const filtered = useMemo(
    () => (jobId ? cards.filter((c) => c.jobId === jobId) : cards),
    [cards, jobId]
  );

  const byStage = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, [] as PipelineCard[]]));
    for (const card of filtered) {
      const bucket = map[card.stage] ?? map.NEW;
      bucket.push(card);
    }
    return map;
  }, [filtered]);

  const moveCard = useCallback(
    async (applicationId: string, stage: string) => {
      if (readOnly) return;
      const previous = cards;
      setCards((current) =>
        current.map((c) => (c.id === applicationId ? { ...c, stage } : c))
      );
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`/api/applications/${applicationId}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ stage }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setCards(previous);
          setError(typeof data.error === "string" ? data.error : "Could not update stage");
          return;
        }
        router.refresh();
      } finally {
        setLoading(false);
      }
    },
    [cards, readOnly, router]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="">All open roles</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        {loading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving…
          </span>
        )}
        <span className="text-xs text-muted">{filtered.length} applicants in view</span>
      </div>

      {error && <p className="text-sm text-risk">{error}</p>}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((column) => (
          <section
            key={column.id}
            className={`min-w-[240px] max-w-[280px] shrink-0 rounded-xl border-2 p-3 ${column.columnClass} ${
              dropStage === column.id ? "ring-2 ring-primary" : ""
            }`}
            onDragOver={(e) => {
              if (readOnly) return;
              e.preventDefault();
              setDropStage(column.id);
            }}
            onDragLeave={() => setDropStage((s) => (s === column.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setDropStage(null);
              const id = e.dataTransfer.getData("application/id");
              if (id) void moveCard(id, column.id);
              setDraggingId(null);
            }}
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                {column.label}
              </h3>
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-muted">
                {(byStage[column.id] ?? []).length}
              </span>
            </header>

            <div className="space-y-2">
              {(byStage[column.id] ?? []).map((card) => (
                <article
                  key={card.id}
                  draggable={!readOnly}
                  onDragStart={(e) => {
                    if (readOnly) return;
                    e.dataTransfer.setData("application/id", card.id);
                    setDraggingId(card.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`rounded-lg border border-border-subtle bg-card p-3 shadow-sm transition ${
                    draggingId === card.id ? "opacity-50" : "hover:border-primary/30"
                  } ${readOnly ? "" : "cursor-grab active:cursor-grabbing"}`}
                >
                  <Link
                    href={`/candidates/${card.candidateId}/applications/${card.id}`}
                    className="block font-semibold text-sm hover:text-primary"
                  >
                    {card.candidate.name}
                  </Link>
                  <p className="mt-1 text-[11px] text-muted line-clamp-1">{card.job.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {card.talentProfile?.roleFitScore != null && (
                      <span className={`text-[10px] font-semibold ${scoreColor(card.talentProfile.roleFitScore)}`}>
                        Fit {formatScore(card.talentProfile.roleFitScore)}
                      </span>
                    )}
                    {card.decision?.hireConfidence != null && (
                      <span className={`text-[10px] font-semibold ${scoreColor(card.decision.hireConfidence)}`}>
                        Hire {formatScore(card.decision.hireConfidence)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <StageBadge stage={card.stage} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
