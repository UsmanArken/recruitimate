import Link from "next/link";
import { Avatar } from "@/components/features/candidates/avatar";
import { formatScore, scoreColor } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export type BulkImportResultCardData = {
  status: "created" | "duplicate";
  fileName: string;
  candidateId: string;
  applicationId: string;
  candidateName: string;
  roleFitScore: number | null;
  hireConfidence: number | null;
  message?: string;
};

export function BulkImportResultCard({ row }: { row: BulkImportResultCardData }) {
  const href = `/candidates/${row.candidateId}/applications/${row.applicationId}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-card p-3 transition hover:border-primary/30 hover:bg-background hover:shadow-sm"
    >
      <Avatar name={row.candidateName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{row.candidateName}</p>
        <p className="truncate text-xs text-muted">{row.fileName}</p>
        {row.status === "duplicate" && row.message && (
          <p className="mt-0.5 text-xs text-warning">{row.message}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-bold tabular-nums ${scoreColor(row.roleFitScore)}`}>
          {formatScore(row.roleFitScore)}
        </p>
        <p className="text-[11px] text-muted">role fit</p>
        {row.hireConfidence != null && (
          <p className="mt-0.5 text-[11px] text-muted">
            {Math.round(row.hireConfidence * 100)}% confidence
          </p>
        )}
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
    </Link>
  );
}
