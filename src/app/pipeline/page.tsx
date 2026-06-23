import { requireAuthContext } from "@/lib/auth/session";
import { organizationFilter, isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineKanbanBoard } from "@/components/features/pipeline/pipeline-kanban-board";
import * as pipelineService from "@/lib/services/pipeline.service";
import { db } from "@/lib/db";
import { Columns3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const ctx = await requireAuthContext();
  const readOnly = isPlatformReadOnlyWorkspace(ctx);
  const applications = await pipelineService.listPipelineBoard(ctx);
  const jobs = await db.job.findMany({
    where: organizationFilter(ctx),
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Kanban view of applicants across hiring stages — drag cards to update pipeline status."
      />

      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Columns3 className="h-5 w-5 text-primary" />
              Kanban pipeline
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                P2-023
              </span>
            </CardTitle>
            <CardDescription>
              {readOnly
                ? "Read-only operator view — drag-drop is disabled."
                : "Drag candidates between columns to move them across stages."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineKanbanBoard
              initialCards={applications}
              jobs={jobs}
              readOnly={readOnly}
            />
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
