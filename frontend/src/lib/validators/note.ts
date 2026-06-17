export const SUGGESTED_NOTE_TAGS = [
  "strength",
  "gap",
  "culture",
  "technical",
  "communication",
  "follow-up",
  "red-flag",
  "standout",
];

export function parseTagsInput(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}
