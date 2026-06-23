import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScore, scoreColor } from "@/lib/utils";
import type { RoleSuggestion } from "@/lib/services/role-suggestion.service";
import { Briefcase, ArrowRight } from "lucide-react";

export function RoleFitSuggestionsPanel({
  candidateId,
  suggestions,
}: {
  candidateId: string;
  suggestions: RoleSuggestion[];
}) {
  if (suggestions.length === 0) return null;

  return (
    <section className="mb-8">
      <Card className="border-brand/15">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4 text-brand" />
            Also consider for these open roles
          </CardTitle>
          <CardDescription>
            Estimated fit from resume vs. each requisition — apply to run full role-fit screening.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {suggestions.map((s) => (
              <li key={s.jobId} className="border-t border-border-subtle first:border-t-0">
                <div className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{s.jobTitle}</p>
                    <p className="text-sm text-muted">{s.reason}</p>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums ${scoreColor(s.estimatedFit)}`}
                  >
                    {formatScore(s.estimatedFit)}
                  </span>
                  <Link
                    href={`/candidates/${candidateId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    Apply below
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
