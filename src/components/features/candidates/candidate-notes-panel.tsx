"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, StickyNote, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SUGGESTED_NOTE_TAGS, parseTagsInput } from "@/lib/validators/note";
import { cn } from "@/lib/utils";

export type NoteRow = {
  id: string;
  content: string;
  tags: unknown;
  createdAt: string;
  author: { id: string; name: string | null; email: string } | null;
};

export function CandidateNotesPanel({
  candidateId,
  initialNotes,
  readOnly = false,
}: {
  candidateId: string;
  initialNotes: NoteRow[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const extraTags = parseTagsInput(tagsInput);
    const tags = [...new Set([...selectedTags, ...extraTags])];

    const res = await fetch(`/api/candidates/${candidateId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ content: trimmed, tags }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not save note");
      return;
    }

    const note = await res.json();
    setNotes((prev) => [note, ...prev]);
    setContent("");
    setTagsInput("");
    setSelectedTags([]);
    router.refresh();
  }

  async function handleDelete(noteId: string) {
    const res = await fetch(`/api/candidates/${candidateId}/notes/${noteId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <StickyNote className="h-5 w-5 text-primary" />
          Recruiter notes
        </CardTitle>
        <CardDescription>
          Shared across all position reviews for this person — phone screens, references, and
          committee context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {readOnly && (
          <p className="text-sm text-muted">
            Notes are visible in read-only mode. Platform operators cannot add or remove notes from
            the workspace.
          </p>
        )}
        {!readOnly && (
        <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-border-subtle bg-background/80 p-4">
          <label className="block">
            <span className="text-sm font-semibold">Add a note</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="e.g. Strong communicator on phone screen; verify notice period…"
              className="input-hr mt-1.5 text-sm"
              required
            />
          </label>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Tags</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED_NOTE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition",
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted hover:border-primary/40"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Custom tags (comma-separated)"
              className="input-hr mt-2 text-xs"
            />
          </div>
          {error && <p className="text-sm text-risk">{error}</p>}
          <Button type="submit" disabled={loading || !content.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save note"
            )}
          </Button>
        </form>
        )}

        {notes.length === 0 ? (
          <p className="text-center text-sm text-muted">No notes yet — capture context for your team.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => {
              const tags = (note.tags as string[]) ?? [];
              return (
                <li
                  key={note.id}
                  className="rounded-lg border border-border-subtle bg-card px-4 py-3 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs text-muted">
                      {note.author?.name ?? note.author?.email ?? "Team member"} ·{" "}
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="shrink-0 rounded p-1 text-muted hover:bg-risk-bg hover:text-risk"
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {note.content}
                  </p>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-brand/8 px-2 py-0.5 text-xs font-medium text-brand"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
