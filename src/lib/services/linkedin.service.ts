import { db } from "@/lib/db";
import { badRequest, notFound } from "@/lib/api/errors";
import { buildCandidateIntelligenceText } from "@/lib/candidate/intelligence-text";
import { assertTenantWorkspaceWrite, organizationFilter } from "@/lib/auth/platform-admin";
import { assertPermission } from "@/lib/auth/permission.service";
import { assertCandidateAccess } from "@/lib/auth/scope.service";
import type { AuthContext } from "@/lib/auth/types";
import { fetchLinkedInProfileText } from "@/lib/linkedin/fetch-profile";
import { parseLinkedInProfile } from "@/lib/linkedin/parse-profile";
import {
  refreshCandidateApplicationsIntelligence,
} from "@/lib/services/candidate-intelligence.service";
import type { LinkedInIngestInput } from "@/lib/validators/linkedin";

export async function parseLinkedInPreview(input: LinkedInIngestInput) {
  const raw =
    input.profileText?.trim() ||
    (input.profileUrl ? await fetchLinkedInProfileText(input.profileUrl) : "");

  if (!raw) {
    throw badRequest("Provide profile text or a LinkedIn URL", "MISSING_PROFILE");
  }

  return parseLinkedInProfile(raw);
}

export async function ingestLinkedInForCandidate(
  ctx: AuthContext,
  candidateId: string,
  input: LinkedInIngestInput
) {
  assertTenantWorkspaceWrite(ctx);
  await assertPermission(ctx, { resource: "candidates", action: "update" });
  await assertCandidateAccess(ctx, candidateId);

  const candidate = await db.candidate.findFirst({
    where: { id: candidateId, ...organizationFilter(ctx) },
  });
  if (!candidate) throw notFound("Candidate");

  const raw =
    input.profileText?.trim() ||
    (input.profileUrl ? await fetchLinkedInProfileText(input.profileUrl) : "");

  if (!raw) {
    throw badRequest("Provide profile text or a LinkedIn URL", "MISSING_PROFILE");
  }

  const parsed = await parseLinkedInProfile(raw);

  const updated = await db.candidate.update({
    where: { id: candidateId },
    data: {
      linkedInText: parsed.normalizedText,
      linkedInUrl: input.profileUrl ?? candidate.linkedInUrl,
    },
  });

  await refreshCandidateApplicationsIntelligence(ctx, candidateId);

  return {
    candidate: updated,
    parsed,
    intelligenceTextLength: buildCandidateIntelligenceText(updated).length,
  };
}
