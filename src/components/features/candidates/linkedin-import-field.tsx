"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Linkedin } from "lucide-react";

type ParsePreview = {
  normalizedText: string;
  headline: string | null;
  skills: string[];
};

export function LinkedInImportField({
  profileUrl,
  onProfileText,
  onUrlChange,
  disabled,
}: {
  profileUrl?: string;
  onProfileText: (text: string) => void;
  onUrlChange?: (url: string) => void;
  disabled?: boolean;
}) {
  const [paste, setPaste] = useState("");
  const [url, setUrl] = useState(profileUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsePreview | null>(null);

  async function handleImport() {
    setLoading(true);
    setError(null);
    setPreview(null);

    const res = await fetch("/api/linkedin/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        profileText: paste.trim() || undefined,
        profileUrl: url.trim() || undefined,
      }),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not import LinkedIn profile");
      return;
    }

    setPreview(data as ParsePreview);
    onProfileText(data.normalizedText);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border-subtle bg-background/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
        LinkedIn intelligence
      </div>
      <p className="text-xs text-muted">
        Paste a profile export or provide a public profile URL — we merge it with resume text for
        richer talent screening.
      </p>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Profile URL</span>
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            onUrlChange?.(e.target.value);
          }}
          placeholder="https://linkedin.com/in/…"
          className="input-hr mt-1 text-sm"
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Or paste profile text
        </span>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={4}
          placeholder="Copy About, Experience, and Skills from LinkedIn…"
          className="input-hr mt-1 text-sm"
          disabled={disabled}
        />
      </label>
      {error && <p className="text-sm text-risk">{error}</p>}
      {preview && (
        <p className="text-xs text-success">
          Imported {preview.skills.length} skills
          {preview.headline ? ` · ${preview.headline}` : ""} — merged into screening context.
        </p>
      )}
      <Button type="button" variant="secondary" disabled={loading || disabled} onClick={handleImport}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing…
          </>
        ) : (
          "Import LinkedIn profile"
        )}
      </Button>
    </div>
  );
}
