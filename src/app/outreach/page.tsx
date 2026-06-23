import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutreachTemplatesPanel } from "@/components/features/outreach/outreach-templates-panel";
import { OutreachCampaignsPanel } from "@/components/features/outreach/outreach-campaigns-panel";
import { Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  let readOnly = false;
  try {
    const ctx = await requireAuthContext();
    readOnly = isPlatformReadOnlyWorkspace(ctx);
  } catch {
    // layout handles auth
  }

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Campaign templates, AI-personalized candidate messages, and response tracking across your talent pools."
      />

      <PageBody>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Campaigns
            </CardTitle>
            <CardDescription>
              P2-012 foundation — create outreach campaigns and manage recipient lists.
            </CardDescription>
          </CardHeader>
          <CardContent>{!readOnly && <OutreachCampaignsPanel />}</CardContent>
        </Card>

        {!readOnly && (
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Reusable message templates with merge variables.</CardDescription>
            </CardHeader>
            <CardContent>
              <OutreachTemplatesPanel />
            </CardContent>
          </Card>
        )}
      </PageBody>
    </>
  );
}
