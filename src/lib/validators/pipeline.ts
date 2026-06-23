import { z } from "zod";
import { PipelineStage } from "@prisma/client";

export const updateApplicationStageSchema = z.object({
  stage: z.nativeEnum(PipelineStage),
});

export const pipelineBoardQuerySchema = z.object({
  jobId: z.string().cuid().optional(),
});
