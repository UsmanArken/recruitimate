import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  return `${Math.round(score * 100)}%`;
}

export function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-muted";
  if (score >= 0.75) return "text-emerald-600";
  if (score >= 0.5) return "text-amber-600";
  return "text-rose-600";
}
