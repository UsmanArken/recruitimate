"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Plus } from "lucide-react";

type TemplateRow = {
  id: string;
  name: string;
  subject: string;
  bodyMarkdown: string;
};

export function OutreachTemplatesPanel() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("{{jobTitle}} opportunity at {{companyName}}");
  const [bodyMarkdown, setBodyMarkdown] = useState(
    `Hi {{candidateName}},\n\nI thought you could be a strong fit for our {{jobTitle}} role.\n\nBest,\n{{recruiterName}}`
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outreach/templates", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTemplate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, subject, bodyMarkdown }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create template");
        return;
      }
      setName("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border-2 border-primary/20 bg-card p-4">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
        <FileText className="h-4 w-4 text-primary" />
        Message templates
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
          P2-012
        </span>
      </h3>
      <p className="mb-4 text-xs text-muted">
        Reusable templates with variables: candidateName, jobTitle, recruiterName, companyName.
      </p>

      {loading ? (
        <p className="text-xs text-muted">Loading templates…</p>
      ) : templates.length > 0 ? (
        <ul className="mb-4 divide-y divide-border-subtle rounded-lg border border-border-subtle">
          {templates.map((t) => (
            <li key={t.id} className="p-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted">{t.subject}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-xs text-muted">No templates yet.</p>
      )}

      <div className="space-y-2">
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Body (markdown)"
          value={bodyMarkdown}
          onChange={(e) => setBodyMarkdown(e.target.value)}
        />
        <Button type="button" className="px-3 py-1.5 text-xs" onClick={() => void createTemplate()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add template
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-risk">{error}</p>}
    </section>
  );
}
