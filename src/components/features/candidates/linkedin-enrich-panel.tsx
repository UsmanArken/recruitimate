"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkedInImportField } from "@/components/features/candidates/linkedin-import-field";
import { Button } from "@/components/ui/button";
import { Loader2, Linkedin } from "lucide-react";

export function LinkedInEnrichPanel({
  candidateId,
  linkedInUrl,
}: {
  candidateId: string;
  linkedInUrl: string | null;
}) {
  const router = useRouter();
  const [profileText, setProfileText] = useState("");
  const [url, setUrl] = useState(linkedInUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function saveToCandidate() {
    if (!profileText.trim() && !url.trim()) {
      setError("Import a profile first.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/candidates/${candidateId}/linkedin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        profileText: profileText.trim() || undefined,
        profileUrl: url.trim() || undefined,
      }),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not save LinkedIn data");
      return;
    }

    setSuccess("LinkedIn profile merged — talent scores refreshed for all campaigns.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          Enrich from LinkedIn
        </CardTitle>
        <CardDescription>
          Import profile data to strengthen role-fit and hidden-signal detection across every open
          position for this person.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LinkedInImportField
          profileUrl={url}
          onUrlChange={setUrl}
          onProfileText={(text) => {
            setProfileText(text);
            setSuccess(null);
          }}
        />
        {error && <p className="text-sm text-risk">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}
        <Button type="button" disabled={loading} onClick={saveToCandidate}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing intelligence…
            </>
          ) : (
            "Save & re-run talent screening"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
