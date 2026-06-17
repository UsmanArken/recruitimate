import { apiFetch } from "@/lib/api-fetch";

export type JobOption = { id: string; title: string };

/** Load open positions for client forms (same data as server listJobs). */
export async function fetchJobOptions(): Promise<{
  jobs: JobOption[];
  error: string | null;
}> {
  try {
    const data = await apiFetch<Array<{ id: string; title: string }>>("/api/jobs");
    const jobs = data
      .filter((j): j is { id: string; title: string } => Boolean(j?.id && j?.title))
      .map((j) => ({ id: j.id, title: j.title }));
    return { jobs, error: null };
  } catch {
    return { jobs: [], error: "Could not load open positions" };
  }
}
