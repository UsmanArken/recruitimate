"use client";

import { useEffect, useState } from "react";
import { Building2, Globe, Trash2, Plus, Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";
import { getStoredUser } from "@/lib/auth-client";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Client = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  companyProfile: string | null;
  impressionNotes: string | null;
  jobCount: number;
};

export default function ClientsSettingsPage() {
  const currentUser = getStoredUser();
  const canManage = currentUser?.roleCode !== "HIRING_MANAGER";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [companyProfile, setCompanyProfile] = useState("");
  const [impressionNotes, setImpressionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadClients() {
    apiFetch<Client[]>("/api/clients")
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          website: website.trim() || undefined,
          companyProfile: companyProfile.trim() || undefined,
          impressionNotes: impressionNotes.trim() || undefined,
        }),
      });
      setName("");
      setWebsite("");
      setCompanyProfile("");
      setImpressionNotes("");
      setSuccess("Client company added.");
      loadClients();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to create client.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(client: Client) {
    if (client.jobCount > 0) return;
    setError(null);
    try {
      await apiFetch(`/api/clients/${client.id}`, { method: "DELETE" });
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete client.");
    }
  }

  return (
    <>
      <PageHeader
        title="Client companies"
        description="Manage the companies you recruit for. Assign clients to jobs for filtering and AI-assisted JD generation."
      />
      <PageBody className="max-w-2xl">

        {/* Add client form — admins/recruiters only */}
        {canManage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Add client company
              </CardTitle>
              <CardDescription>
                Add a company profile so Recruitimate can generate role-specific job descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Company name <span className="text-risk">*</span></span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Acme Corp"
                    className="input-hr mt-1.5"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Website</span>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    type="url"
                    className="input-hr mt-1.5"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Company profile</span>
                  <p className="mt-0.5 text-xs text-muted">
                    Describe this company — culture, tech stack, team size. Used by AI to generate job descriptions.
                  </p>
                  <textarea
                    value={companyProfile}
                    onChange={(e) => setCompanyProfile(e.target.value)}
                    rows={4}
                    placeholder="A fast-growing fintech startup building payments infrastructure…"
                    className="input-hr mt-1.5"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-foreground">Impression notes</span>
                  <p className="mt-0.5 text-xs text-muted">
                    Internal recruiter notes about employer brand, candidate experience, or red flags.
                  </p>
                  <textarea
                    value={impressionNotes}
                    onChange={(e) => setImpressionNotes(e.target.value)}
                    rows={2}
                    className="input-hr mt-1.5"
                  />
                </label>

                {formError && (
                  <p className="rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{formError}</p>
                )}
                {success && (
                  <p className="rounded-lg bg-success-bg px-3 py-2 text-sm text-success">{success}</p>
                )}

                <Button type="submit" disabled={submitting || !name.trim()}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding…</>
                  ) : (
                    "Add client"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Client list */}
        <Card>
          <CardHeader>
            <CardTitle>Your clients</CardTitle>
            <CardDescription>
              {clients.length === 0 ? "No clients yet." : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <p className="mx-6 mb-4 rounded-lg bg-risk-bg px-3 py-2 text-sm text-risk">{error}</p>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted" />
              </div>
            ) : clients.length === 0 ? (
              <p className="px-6 py-8 text-sm text-muted">No clients yet. Add one above.</p>
            ) : (
              <ul>
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center gap-4 border-t border-border-subtle px-6 py-4 first:border-t-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                      <Building2 className="h-4 w-4 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{client.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                        {client.website && (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Globe className="h-3 w-3" />
                            {client.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                        <span>{client.jobCount} job{client.jobCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(client)}
                        disabled={client.jobCount > 0}
                        title={client.jobCount > 0 ? `Cannot delete — ${client.jobCount} job(s) assigned` : "Delete client"}
                        className="rounded-md p-1.5 text-muted transition hover:bg-risk-bg hover:text-risk disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </PageBody>
    </>
  );
}
