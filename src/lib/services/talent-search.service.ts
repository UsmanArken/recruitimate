import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";
import { searchTalentCandidates } from "@/lib/intelligence/talent/search-engine";
import { loadSearchableCandidates } from "@/lib/services/talent-discovery.service";
import type { talentSearchSchema } from "@/lib/validators/talent-search";
import type { z } from "zod";

export type TalentSearchInput = z.infer<typeof talentSearchSchema>;

export async function searchTalent(ctx: AuthContext, input: TalentSearchInput) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });

  const candidates = await loadSearchableCandidates(ctx, input.poolId);
  const searchable = candidates
    .filter((c) => c.searchDocument.length >= 10)
    .map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      searchDocument: c.searchDocument,
      searchSkills: c.searchSkills,
      experienceYears: c.experienceYears,
    }));

  return searchTalentCandidates(
    input.query,
    searchable,
    input.poolId ?? null,
    input.limit
  );
}
