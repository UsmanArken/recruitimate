import { spawnSync } from "child_process";

export type StepResult = {
  name: string;
  ok: boolean;
  detail?: string;
};

export function runCommand(
  name: string,
  command: string,
  args: string[] = []
): StepResult {
  process.stdout.write(`\n▶ ${name}…\n`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.status === 0) {
    process.stdout.write(`✓ ${name}\n`);
    return { name, ok: true };
  }

  const detail =
    result.error?.message ??
    `exit code ${result.status ?? "unknown"}`;
  process.stdout.write(`✗ ${name} — ${detail}\n`);
  return { name, ok: false, detail };
}

export function printSummary(results: StepResult[]) {
  const failed = results.filter((r) => !r.ok);
  process.stdout.write("\n────────────────────────────────────────\n");
  if (failed.length === 0) {
    process.stdout.write(`✓ QA passed (${results.length} steps)\n`);
    return;
  }
  process.stdout.write(`✗ QA failed: ${failed.length}/${results.length} steps\n`);
  for (const f of failed) {
    process.stdout.write(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}\n`);
  }
}
