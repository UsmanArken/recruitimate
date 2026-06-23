#!/usr/bin/env npx tsx
/**
 * Recruitimate QA runner
 *
 * Usage:
 *   npm run qa              # static + unit + db (+ api if QA_BASE_URL set)
 *   npm run qa:static       # lint, typecheck, prisma validate, build
 *   npm run qa:unit         # intelligence + validator tests
 *   npm run qa:db           # database seed / connectivity checks
 *   npm run qa:api          # HTTP smoke (app must be running)
 *
 * With API smoke in full qa:
 *   QA_BASE_URL=http://localhost:3000 npm run qa
 */

import { runCommand, printSummary, type StepResult } from "./exec";

const args = new Set(process.argv.slice(2));
const staticOnly = args.has("--static-only");
const skipBuild = args.has("--skip-build");
const withApi =
  args.has("--with-api") || Boolean(process.env.QA_BASE_URL?.trim());

async function main() {
  const results: StepResult[] = [];

  console.log("Recruitimate QA\n");

  results.push(runCommand("ESLint", "npm", ["run", "lint"]));
  results.push(runCommand("TypeScript", "npx", ["tsc", "--noEmit"]));
  results.push(runCommand("Prisma validate", "npx", ["prisma", "validate"]));

  if (staticOnly) {
    printSummary(results);
    process.exit(results.some((r) => !r.ok) ? 1 : 0);
  }

  if (!skipBuild) {
    results.push(runCommand("Production build", "npm", ["run", "build"]));
  }

  results.push(
    runCommand("Unit tests", "npx", [
      "tsx",
      "--test",
      "scripts/qa/intelligence.test.ts",
      "scripts/qa/validators.test.ts",
      "scripts/qa/resume-extract.test.ts",
      "scripts/qa/linkedin-parse.test.ts",
      "scripts/qa/llm-config.test.ts",
      "scripts/qa/live-assist.test.ts",
      "scripts/qa/cross-signal.test.ts",
      "scripts/qa/question-bank.test.ts",
      "scripts/qa/interviewer-quality.test.ts",
      "scripts/qa/audio-signal.test.ts",
      "scripts/qa/video-behavioral.test.ts",
      "scripts/qa/talent-discovery.test.ts",
      "scripts/qa/talent-search.test.ts",
      "scripts/qa/talent-suggest.test.ts",
      "scripts/qa/outreach-template.test.ts",
      "scripts/qa/outreach-personalize.test.ts",
      "scripts/qa/outreach-tracking.test.ts",
      "scripts/qa/assessment-engine.test.ts",
      "scripts/qa/assessment-evaluation.test.ts",
      "scripts/qa/assessment-decision.test.ts",
      "scripts/qa/copilot.test.ts",
      "scripts/qa/storage.test.ts",
      "scripts/qa/background-job.test.ts",
      "scripts/qa/pipeline.test.ts",
      "scripts/qa/email-notifications.test.ts",
    ])
  );

  results.push(runCommand("Database smoke", "npx", ["tsx", "scripts/qa/db-smoke.ts"]));

  if (withApi) {
    const base = process.env.QA_BASE_URL ?? "http://localhost:3000";
    console.log(`\n(API smoke → ${base})\n`);
    results.push(runCommand("API smoke", "npx", ["tsx", "scripts/qa/api-smoke.ts"]));
  } else {
    console.log(
      "\nℹ Skipping API smoke (set QA_BASE_URL or pass --with-api while dev server is running)\n"
    );
  }

  printSummary(results);
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

main();
