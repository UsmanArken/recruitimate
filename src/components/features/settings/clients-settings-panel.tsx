"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Trash2 } from "lucide-react";

export type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  companyProfile: string | null;
  impressionNotes: string | null;
  webDataConsentAt: string | null;
  _count: { jobs: number };
};

export function ClientsSettingsPanel({ initialClients }: { initialClients: ClientRow[] }) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createClient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        name: fd.get("name"),
        website: fd.get("website") || undefined,
        companyProfile: fd.get("companyProfile") || undefined,
        impressionNotes: fd.get("impressionNotes") || undefined,
        webDataConsent: fd.get("webDataConsent") === "on",
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not create client");
      return;
    }
    const created = await res.json();
    setClients((prev) => [
      ...prev,
      {
        ...created,
        webDataConsentAt: created.webDataConsentAt ?? null,
        _count: created._count ?? { jobs: 0 },
      },
    ]);
    router.refresh();
    (e.target as HTMLFormElement).reset();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this client company?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Could not delete");
      return;
    }
    setClients((c) => c.filter((x) => x.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add client company
          </CardTitle>
          <CardDescription>
            Recruit for Acme, ABC, DEF, etc. from one workspace. Company profile feeds JD generation
            and interviewer scripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void createClient(e)} className="space-y-4">
            <Field label="Company name" name="name" required />
            <Field label="Website" name="website" placeholder="https://acme.com" />
            <Field label="Company profile" name="companyProfile" multiline rows={5} />
            <Field
              label="Employer brand notes"
              name="impressionNotes"
              multiline
              rows={3}
              placeholder="What candidates say about the company, areas HR wants to improve…"
            />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="webDataConsent" className="mt-1" />
              <span>
                I consent to Recruitimate fetching public web data about this company to enrich
                profiles (Glassdoor / search integrations coming later).
              </span>
            </label>
            {error && <p className="text-sm text-risk">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Add company"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your client companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-sm text-muted">No client companies yet.</p>
          ) : (
            clients.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border-subtle p-4"
              >
                <div>
                  <p className="font-semibold">{c.name}</p>
                  {c.website && <p className="text-sm text-muted">{c.website}</p>}
                  <p className="mt-1 text-xs text-muted">{c._count.jobs} open role(s)</p>
                  {c.webDataConsentAt && (
                    <p className="mt-1 text-xs text-success">Web research consent on file</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={c._count.jobs > 0}
                  onClick={() => void remove(c.id)}
                  title={c._count.jobs > 0 ? "Delete roles first" : "Delete company"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  multiline,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {multiline ? (
        <textarea name={name} required={required} rows={rows} className="input-hr mt-1.5" placeholder={placeholder} />
      ) : (
        <input name={name} required={required} className="input-hr mt-1.5" placeholder={placeholder} />
      )}
    </label>
  );
}
