export type BackgroundJobPollResult = {
  status: string;
  result?: unknown;
  error?: string | null;
};

export async function pollBackgroundJob(
  jobId: string,
  options?: { intervalMs?: number; maxAttempts?: number }
): Promise<BackgroundJobPollResult> {
  const intervalMs = options?.intervalMs ?? 1500;
  const maxAttempts = options?.maxAttempts ?? 120;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(`/api/background-jobs/${jobId}`, {
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === "string" ? data.error : "Could not load job status");
    }

    if (data.status === "COMPLETED") {
      return { status: data.status, result: data.result };
    }
    if (data.status === "FAILED") {
      throw new Error(data.error ?? "Background job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Job timed out — check back shortly or run the worker process");
}
