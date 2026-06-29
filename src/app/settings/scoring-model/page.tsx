import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoringModelPanel } from "@/components/features/learning/scoring-model-panel";
import { Brain, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ScoringModelSettingsPage() {
  await requireAuthContext();

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-4">
        <Link
          href="/settings/team"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Team settings
        </Link>
      </div>

      <PageHeader
        title="Scoring model"
        description="Decision-layer weights the learning engine retrains from real hiring outcomes."
      />

      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Learned decision weights
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                P3-003
              </span>
            </CardTitle>
            <CardDescription>
              Talent, interview, and assessment weights are blended into hire confidence.
              Retraining shifts weight toward the signals that best predicted good hires for
              your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoringModelPanel />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
