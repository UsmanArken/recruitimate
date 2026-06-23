import { requireAuthContext } from "@/lib/auth/session";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { listHiringClients } from "@/lib/services/hiring-client.service";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ClientsSettingsPanel } from "@/components/features/settings/clients-settings-panel";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientsSettingsPage() {
  const ctx = await requireAuthContext();
  if (isPlatformReadOnlyWorkspace(ctx)) redirect("/admin");

  const clients = await listHiringClients(ctx);

  return (
    <>
      <PageHeader
        title="Client companies"
        description="Organizations you recruit for — company profile, website, and consent for future employer-brand research."
      />
      <PageBody className="max-w-2xl">
        <ClientsSettingsPanel
          initialClients={clients.map((c) => ({
            ...c,
            webDataConsentAt: c.webDataConsentAt?.toISOString() ?? null,
          }))}
        />
      </PageBody>
    </>
  );
}
