import { notFound } from "next/navigation";
import Link from "next/link";
import { serverFetch } from "@/lib/api-server";
import { PageBody } from "@/components/layout/page-header";
import { Avatar } from "@/components/features/candidates/avatar";
import { ApplyToPosition } from "@/components/features/candidates/apply-to-position";
import { CandidateNotesPanel } from "@/components/features/candidates/candidate-notes-panel";
import { LinkedInEnrichPanel } from "@/components/features/candidates/linkedin-enrich-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteCandidateButton } from "@/components/features/candidates/delete-candidate-button";
import { CandidateSourceProfile } from "@/components/features/candidates/candidate-source-profile";
import { CandidateMarkingControl } from "@/components/features/candidates/candidate-marking-control";
import { CandidateApplicationsList } from "@/components/features/candidates/candidate-applications-list";
import { ChevronLeft, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatePersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [candidate, jobs] = await Promise.all([
    serverFetch<{
      id: string;
      name: string;
      email: string | null;
      linkedInUrl: string | null;
      githubUrl: string | null;
      portfolioUrl: string | null;
      resumeText: string | null;
      marking: string;
      applications: Array<{
        id: string;
        stage: string;
        jobId: string;
        job: { id: string; title: string } | null;
        talentProfile: { roleFitScore: number | null } | null;
        decision: { recommendation: string | null } | null;
        hireReviewVerdict: string | null;
      }>;
      notes: Array<{
        id: string;
        content: string;
        tags: string[] | null;
        createdAt: string;
        author: { id: string; name: string | null; email: string };
      }>;
    }>(`/api/candidates/${id}`).catch(() => null),
    serverFetch<Array<{ id: string; title: string }>>("/api/jobs"),
  ]);

  if (!candidate) notFound();

  const appliedJobIds = candidate.applications.map((a) => a.jobId);
  const openJobs = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <>
      <div className="border-b border-border bg-card px-8 py-6">
        <Link
          href="/candidates"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to candidates
        </Link>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar name={candidate.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{candidate.name}</h1>
              <CandidateMarkingControl
                candidateId={candidate.id}
                initialMarking={candidate.marking}
              />
              <DeleteCandidateButton candidateId={candidate.id} candidateName={candidate.name} />
            </div>
            {candidate.email && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <Mail className="h-3.5 w-3.5" />
                {candidate.email}
              </p>
            )}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              One resume, multiple hiring campaigns. Each open position has its own role fit,
              interviews, and hire recommendation.
            </p>
          </div>
        </div>
      </div>

      <PageBody>
        <section className="mb-8">
          <CandidateSourceProfile
            name={candidate.name}
            email={candidate.email}
            linkedInUrl={candidate.linkedInUrl}
            githubUrl={candidate.githubUrl}
            portfolioUrl={candidate.portfolioUrl}
            resumeText={candidate.resumeText}
          />
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open position reviews</CardTitle>
              <CardDescription>
                Select a campaign to view talent screening, interviews, and decision intelligence
                for that requisition.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CandidateApplicationsList
                candidateId={candidate.id}
                initialApplications={candidate.applications}
              />
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <LinkedInEnrichPanel
            candidateId={candidate.id}
            linkedInUrl={candidate.linkedInUrl}
          />
        </section>

        <section className="mb-8">
          <CandidateNotesPanel
            candidateId={candidate.id}
            initialNotes={candidate.notes}
            readOnly={false}
          />
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply to another position</CardTitle>
              <CardDescription>
                Reuse the same resume for a different hiring campaign — role fit and decisions
                are computed per position.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplyToPosition
                candidateId={candidate.id}
                excludeJobIds={appliedJobIds}
                initialJobs={openJobs}
              />
            </CardContent>
          </Card>
        </section>
      </PageBody>
    </>
  );
}
