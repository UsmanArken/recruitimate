import Link from "next/link";
import { requireAuthContext } from "@/lib/auth/session";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailNotificationsPanel } from "@/components/features/notifications/email-notifications-panel";
import { Bell, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
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
        title="Email notifications"
        description="Stage change and interview analyzed alerts for hiring managers and interviewers."
      />

      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification log
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                P2-025
              </span>
            </CardTitle>
            <CardDescription>
              Default mode logs to the database (and server console). Set EMAIL_PROVIDER=smtp for
              real delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailNotificationsPanel />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
