import { assertPermission } from "@/lib/auth/permission.service";
import type { AuthContext } from "@/lib/auth/types";
import { suggestCandidatesForJob } from "@/lib/intelligence/talent/suggest-engine";
import { getJobById } from "@/lib/services/job.service";
import { loadSearchableCandidates } from "@/lib/services/talent-discovery.service";
import type { talentSuggestSchema } from "@/lib/validators/talent-suggest";
import type { z } from "zod";

export type TalentSuggestInput = z.infer<typeof talentSuggestSchema>;

export async function suggestCandidatesForJobById(
  ctx: AuthContext,
  jobId: string,
  input: TalentSuggestInput
) {
  await assertPermission(ctx, { resource: "intelligence", action: "run" });
  const job = await getJobById(ctx, jobId);

  const candidates = await loadSearchableCandidates(ctx, input.poolId);
  const suggestable = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    searchDocument: c.searchDocument,
    searchSkills: c.searchSkills,
    experienceYears: c.experienceYears,
    alreadyApplied: c.jobIds.includes(jobId),
  }));

  return suggestCandidatesForJob(
    jobId,
    job.title,
    job.requirements,
    suggestable,
    input.limit
  );
}
