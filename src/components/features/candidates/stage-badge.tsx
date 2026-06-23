import { cn } from "@/lib/utils";
import { pipelineStageBadgeClass, pipelineStageLabel } from "@/lib/pipeline/stages";

export function StageBadge({ stage }: { stage: string }) {
  const key = stage.toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        pipelineStageBadgeClass(key)
      )}
    >
      {pipelineStageLabel(key)}
    </span>
  );
}
