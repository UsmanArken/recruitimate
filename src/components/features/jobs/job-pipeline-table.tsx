import Link from "next/link";
import { Avatar } from "@/components/features/candidates/avatar";
import { StageBadge } from "@/components/features/candidates/stage-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatScore, scoreColor } from "@/lib/utils";
import { ArrowRight, Users } from "lucide-react";

export type JobPipelineRow = {
  id: string;
  stage: string;
  candidate: { id: string; name: string; email: string | null };
  talentProfile: { roleFitScore: number | null } | null;
  decision: {
    hireConfidence: number | null;
    recommendation: string | null;
  } | null;
};

function confidenceLabel(
  recommendation: string | null | undefined,
  hireConfidence: number | null | undefined
): string {
  if (recommendation === "pending_interview") return "Awaiting interview";
  if (hireConfidence != null) return `${Math.round(hireConfidence * 100)}% confidence`;
  return "—";
}

export function JobPipelineTable({
  applications,
}: {
  applications: JobPipelineRow[];
}) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No applicants yet"
        description="Bulk upload resumes above or add candidates one by one — they'll appear here ranked by role fit."
        primaryAction={{ href: "/candidates/new", label: "Add single applicant" }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border-subtle bg-gradient-to-r from-talent-bg/40 to-transparent px-5 py-3">
        <p className="text-sm font-semibold text-foreground">Applicant pipeline</p>
        <p className="text-xs text-muted">Sorted by role fit — highest first</p>
      </div>
      <div className="overflow-x-auto">
        <table className="table-hr w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-5 py-3.5 w-12">#</th>
              <th className="px-5 py-3.5">Candidate</th>
              <th className="px-5 py-3.5">Stage</th>
              <th className="px-5 py-3.5">Role fit</th>
              <th className="px-5 py-3.5">Decision</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app, index) => (
              <tr key={app.id}>
                <td className="px-5 py-4 text-xs font-bold tabular-nums text-muted">{index + 1}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/candidates/${app.candidate.id}/applications/${app.id}`}
                    className="flex items-center gap-3 font-semibold text-foreground hover:text-primary"
                  >
                    <Avatar name={app.candidate.name} size="sm" />
                    <span>{app.candidate.name}</span>
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <StageBadge stage={app.stage} />
                </td>
                <td
                  className={`px-5 py-4 text-base font-bold tabular-nums ${scoreColor(app.talentProfile?.roleFitScore)}`}
                >
                  {formatScore(app.talentProfile?.roleFitScore)}
                </td>
                <td className="px-5 py-4 text-sm text-muted">
                  {confidenceLabel(app.decision?.recommendation, app.decision?.hireConfidence)}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/candidates/${app.candidate.id}/applications/${app.id}?tab=screen`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15"
                  >
                    Talent review
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
