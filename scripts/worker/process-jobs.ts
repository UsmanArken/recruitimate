#!/usr/bin/env npx tsx
/**
 * Background job worker — polls queued jobs and runs transcription / analysis handlers.
 *
 * Usage:
 *   npm run worker:jobs
 *   npm run worker:jobs -- --once
 */

import { processQueuedJobs } from "../../src/lib/jobs/processor";

const once = process.argv.includes("--once");
const intervalMs = Number(process.env.JOB_WORKER_INTERVAL_MS ?? 3000);

async function tick() {
  const count = await processQueuedJobs(5);
  if (count > 0) {
    console.log(`[worker] processed up to ${count} job(s)`);
  }
}

async function main() {
  console.log("Recruitimate job worker started");
  if (once) {
    await tick();
    return;
  }

  for (;;) {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

main().catch((error) => {
  console.error("[worker] fatal", error);
  process.exit(1);
});
