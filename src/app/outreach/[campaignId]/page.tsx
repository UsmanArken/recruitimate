import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageBody } from "@/components/layout/page-header";
import { OutreachCampaignDetailPanel } from "@/components/features/outreach/outreach-campaign-detail-panel";

export const dynamic = "force-dynamic";

export default async function OutreachCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-4">
        <Link
          href="/outreach"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to outreach
        </Link>
      </div>
      <PageBody>
        <OutreachCampaignDetailPanel campaignId={campaignId} />
      </PageBody>
    </>
  );
}
