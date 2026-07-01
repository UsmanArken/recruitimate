import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TalentDiscoveryPanel } from "@/components/features/talent/talent-discovery-panel";
import { TalentSearchPanel } from "@/components/features/talent/talent-search-panel";
import { LaborMarketStatusPanel } from "@/components/features/talent/labor-market-status-panel";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TalentPage() {
  let readOnly = false;
  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
  } catch {
    // unauthenticated handled by layout
  }

  return (
    <>
      <PageHeader
        title="Talent discovery"
        description="Search, pool, and recommend candidates from your internal talent corpus — multi-source ingestion with ethical aggregated indexing only."
      />

      <PageBody>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Discovery engine
            </CardTitle>
            <CardDescription>
              P2-009 — Create talent pools, ingest profiles from multiple sources, and keep the
              search index up to date.
            </CardDescription>
          </CardHeader>
          <CardContent>{!readOnly && <TalentDiscoveryPanel />}</CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Labor market integration
            </CardTitle>
            <CardDescription>
              P3-007 — Passive candidate signals from external labor market providers. Scan from any
              open role&apos;s detail page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LaborMarketStatusPanel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranked search</CardTitle>
            <CardDescription>
              P2-010 — Natural-language candidate search ranked by skill and term overlap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TalentSearchPanel />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
