import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { executeAnalyzeInterviewJob } from "@/lib/jobs/handlers/analyze-interview";
import { executeTranscribeInterviewJob } from "@/lib/jobs/handlers/transcribe-interview";
import type {
  AnalyzeInterviewPayload,
  TranscribeInterviewPayload,
} from "@/lib/jobs/types";

export async function dispatchJob(jobId: string): Promise<void> {
  const job = await db.backgroundJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === "COMPLETED" || job.status === "RUNNING") return;

  const claimed = await db.backgroundJob.updateMany({
    where: { id: jobId, status: "QUEUED" },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  if (claimed.count === 0) return;

  try {
    let result: Prisma.InputJsonValue;

    switch (job.type) {
      case "TRANSCRIBE_INTERVIEW":
        result = (await executeTranscribeInterviewJob(
          job.organizationId,
          job.payload as TranscribeInterviewPayload
        )) as Prisma.InputJsonValue;
        break;
      case "ANALYZE_INTERVIEW":
        result = (await executeAnalyzeInterviewJob(
          job.organizationId,
          job.payload as AnalyzeInterviewPayload
        )) as Prisma.InputJsonValue;
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }

    await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        result,
        error: null,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const current = await db.backgroundJob.findUnique({ where: { id: jobId } });
    const failed = (current?.attempts ?? 1) >= (current?.maxAttempts ?? 3);

    await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        status: failed ? "FAILED" : "QUEUED",
        error: message,
        completedAt: failed ? new Date() : null,
        startedAt: failed ? current?.startedAt : null,
      },
    });

    if (!failed) {
      throw error;
    }
  }
}

export async function processQueuedJobs(limit = 5): Promise<number> {
  const jobs = await db.backgroundJob.findMany({
    where: { status: "QUEUED", runAfter: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  for (const job of jobs) {
    await dispatchJob(job.id);
  }

  return jobs.length;
}
