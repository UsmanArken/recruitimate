import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Linkedin } from "lucide-react";

export function LinkedInEnrichPanel({
  candidateId: _candidateId,
  linkedInUrl: _linkedInUrl,
}: {
  candidateId: string;
  linkedInUrl: string | null;
}) {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          Enrich from LinkedIn
          <span className="ml-1 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted">
            Coming soon
          </span>
        </CardTitle>
        <CardDescription>
          Automatic LinkedIn profile enrichment is planned for a future release. When available,
          it will merge profile data with resume text to strengthen role-fit and hidden-signal
          detection across every campaign.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted">This feature is not yet available.</p>
      </CardContent>
    </Card>
  );
}
