import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Scores are stored as 0–100 (e.g. roleFitScore=65, confidenceScore=80)
export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  return `${Math.round(score)}%`;
}

export function scoreColor(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return "text-muted";
  const effective = invert ? 100 - score : score;
  if (effective >= 75) return "text-success";
  if (effective >= 50) return "text-warning";
  return "text-risk";
}

export function scoreBarColor(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return "bg-border";
  const effective = invert ? 100 - score : score;
  if (effective >= 75) return "bg-success";
  if (effective >= 50) return "bg-warning";
  return "bg-risk";
}
