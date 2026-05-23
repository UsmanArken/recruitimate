import { z } from "zod";

const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[a-z0-9-]+$/, "Tags use lowercase letters, numbers, and hyphens");

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, "Note cannot be empty").max(5000),
  tags: z.array(tagSchema).max(8).default([]),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/** Parse comma-separated tags from a single input field. */
export function parseTagsInput(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean)
    ),
  ].slice(0, 8);
}

export const SUGGESTED_NOTE_TAGS = [
  "phone-screen",
  "reference-check",
  "strong-yes",
  "follow-up",
  "concern",
  "culture-fit",
] as const;
