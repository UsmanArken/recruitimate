import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  roleCode: z.string().min(1),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
