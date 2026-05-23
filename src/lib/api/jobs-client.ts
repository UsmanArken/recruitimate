export type JobOption = { id: string; title: string };

/** Load open positions for client forms (same data as server listJobs). */
export async function fetchJobOptions(): Promise<{
  jobs: JobOption[];
  error: string | null;
}> {
  try {
    const res = await fetch("/api/jobs", { credentials: "same-origin" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        data && typeof data.error === "string"
          ? data.error
          : "Could not load open positions";
      return { jobs: [], error: message };
    }

    if (!Array.isArray(data)) {
      return { jobs: [], error: "Unexpected response when loading open positions" };
    }

    const jobs = data
      .filter((j): j is { id: string; title: string } => j?.id && j?.title)
      .map((j) => ({ id: j.id, title: j.title }));

    return { jobs, error: null };
  } catch {
    return { jobs: [], error: "Could not load open positions" };
  }
}
