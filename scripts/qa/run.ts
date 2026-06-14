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
