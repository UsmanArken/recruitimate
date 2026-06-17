import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  return `${Math.round(score * 100)}%`;
}

export function scoreColor(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return "text-muted";
  const effective = invert ? 1 - score : score;
  if (effective >= 0.75) return "text-success";
  if (effective >= 0.5) return "text-warning";
  return "text-risk";
}

export function scoreBarColor(
  score: number | null | undefined,
  invert = false
): string {
  if (score == null) return "bg-border";
  const effective = invert ? 1 - score : score;
  if (effective >= 0.75) return "bg-success";
  if (effective >= 0.5) return "bg-warning";
  return "bg-risk";
}
