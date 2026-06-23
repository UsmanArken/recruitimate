import { requireAuthContext } from "@/lib/auth/session";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopilotChatPanel } from "@/components/features/copilot/copilot-chat-panel";
import { Bot } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  try {
    await requireAuthContext();
  } catch {
    // layout handles auth
  }

  return (
    <>
      <PageHeader
        title="AI Copilot"
        description="Natural-language hiring assistant — rank candidates, compare finalists, and summarize interviews with explainable signals."
      />

      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Copilot chat
            </CardTitle>
            <CardDescription>
              P2-018 foundation with comparison (P2-019) and interview summary (P2-020) intents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CopilotChatPanel />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
