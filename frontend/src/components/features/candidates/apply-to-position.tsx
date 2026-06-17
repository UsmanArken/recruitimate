"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchJobOptions } from "@/lib/api/jobs-client";
import type { JobOption } from "@/lib/api/jobs-client";
import { JobPositionPicker } from "@/components/features/candidates/job-position-picker";
import { Loader2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api-fetch";

export function ApplyToPosition({
  candidateId,
  excludeJobIds = [],
  initialJobs,
}: {
  candidateId: string;
  excludeJobIds?: string[];
  /** When provided (from server), skip client fetch — matches Open Roles list. */
  initialJobs?: JobOption[];
}) {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobOption[]>(initialJobs ?? []);
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(!initialJobs);
  const [error, setError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    if (initialJobs) return;

    let cancelled = false;
    setLoadingJobs(true);
    void fetchJobOptions().then(({ jobs: loaded, error: err }) => {
      if (cancelled) return;
      setJobs(loaded);
      setJobsError(err);
      setLoadingJobs(false);
    });

    return () => {
      cancelled = true;
    };
  }, [initialJobs]);

  const excluded = new Set(excludeJobIds);
  const available = jobs.filter((j) => !excluded.has(j.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId) return;
    setLoading(true);
    setError(null);

    try {
      const application = await apiFetch<{ id: string }>(
        `/api/candidates/${candidateId}/applications`,
        { method: "POST", body: JSON.stringify({ jobId }) }
      );
      setLoading(false);
      router.push(`/candidates/${candidateId}/applications/${application.id}`);
      router.refresh();
    } catch (e) {
      setLoading(false);
      setError(e instanceof ApiError ? e.message : "Could not add position");
    }
  }

  if (loadingJobs) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading open positions…
      </p>
    );
  }

  if (jobsError) {
    return <p className="text-sm text-risk">{jobsError}</p>;
  }

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted">
        {excludeJobIds.length > 0 ? (
          "This person is already in review for all open positions, or none are available."
        ) : (
          <>
            No open positions yet.{" "}
            <Link href="/jobs/new" className="font-semibold text-primary hover:underline">
              Create a hiring campaign
            </Link>{" "}
            first.
          </>
        )}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-foreground">Another open position</span>
        <JobPositionPicker
          jobs={available}
          value={jobId}
          onChange={setJobId}
          className="mt-1.5"
        />
      </label>
      <Button type="submit" disabled={loading || !jobId} className="shrink-0">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting review…
          </>
        ) : (
          "Apply to position"
        )}
      </Button>
      {error && <p className="text-sm text-risk">{error}</p>}
    </form>
  );
}
