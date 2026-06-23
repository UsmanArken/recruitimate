import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";

const INTEGRATIONS = [
  { name: "LinkedIn Recruiter", status: "Planned", note: "Publish jobs and source candidates" },
  { name: "Indeed", status: "Planned", note: "Post ads and ingest applicant CVs" },
  { name: "Greenhouse", status: "Planned", note: "ATS sync" },
  { name: "Lever", status: "Planned", note: "Push JDs and pull pipeline updates" },
  { name: "Glassdoor / web research", status: "Planned", note: "Employer brand signals (uses company web consent)" },
];

export default function IntegrationsSettingsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect job boards and ATS tools. API key setup ships in a future release."
      />
      <PageBody className="max-w-2xl space-y-4">
        {INTEGRATIONS.map((item) => (
          <Card key={item.name}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plug className="h-4 w-4 text-primary" />
                {item.name}
              </CardTitle>
              <CardDescription>{item.note}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="rounded-full bg-muted/15 px-2.5 py-1 text-xs font-semibold text-muted">
                {item.status}
              </span>
            </CardContent>
          </Card>
        ))}
      </PageBody>
    </>
  );
}
