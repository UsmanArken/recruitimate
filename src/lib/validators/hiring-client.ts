import { z } from "zod";

export const createHiringClientSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  companyProfile: z.string().optional(),
  impressionNotes: z.string().optional(),
  webDataConsent: z.boolean().optional(),
});

export const updateHiringClientSchema = createHiringClientSchema.partial();

export type CreateHiringClientInput = z.infer<typeof createHiringClientSchema>;
export type UpdateHiringClientInput = z.infer<typeof updateHiringClientSchema>;
