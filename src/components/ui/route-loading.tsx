import { Loader2 } from "lucide-react";
import { PageBody } from "@/components/layout/page-header";

export function RouteLoading({
  title = "Loading…",
  description = "Fetching your workspace data.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <PageBody>
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
        <div>
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <div className="mt-4 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-xl bg-muted/15" />
          <div className="h-28 animate-pulse rounded-xl bg-muted/15" />
          <div className="col-span-full h-40 animate-pulse rounded-xl bg-muted/10" />
        </div>
      </div>
    </PageBody>
  );
}
