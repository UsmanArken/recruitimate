import { z } from "zod";

export const linkedInIngestSchema = z
  .object({
    profileText: z.string().min(40).optional(),
    profileUrl: z.string().url().optional(),
  })
  .refine((v) => Boolean(v.profileText?.trim() || v.profileUrl), {
    message: "Provide profile text or a LinkedIn URL",
  });

export type LinkedInIngestInput = z.infer<typeof linkedInIngestSchema>;

export const linkedInParseSchema = z
  .object({
    profileText: z.string().min(40).optional(),
    profileUrl: z.string().url().optional(),
  })
  .refine((v) => Boolean(v.profileText?.trim() || v.profileUrl), {
    message: "Provide profile text or a LinkedIn URL",
  });
