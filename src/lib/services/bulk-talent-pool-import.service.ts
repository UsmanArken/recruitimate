import { createHash } from "crypto";
import { db } from "@/lib/db";
import { isAppError } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import { normalizeResumeText } from "@/lib/resume/extract-text";
import {
  extractEmailFromResume,
  resolveCandidateDisplayName,
} from "@/lib/resume/parse-contact";
import { estimateRoleFitHeuristic } from "@/lib/intelligence/talent/engine";
import * as resumeParseService from "@/lib/services/resume-parse.service";
import * as candidateService from "@/lib/services/candidate.service";
import * as applicationService from "@/lib/services/application.service";
import { getJobById } from "@/lib/services/job.service";
import { jobsWhereClause } from "@/lib/auth/scope.service";
import type { BulkImportRowResult } from "@/lib/services/bulk-resume-import.service";
import { importResumesForJob } from "@/lib/services/bulk-resume-import.service";

export type TalentPoolImportRow = {
  status: "created" | "duplicate" | "failed";
  fileName: string;
  candidateId?: string;
  candidateName?: string;
  suggestedRoles?: { jobId: string; jobTitle: string; estimatedFit: number }[];
  error?: string;
  code?: string;
  message?: string;
};

function resumeContentHash(text: string): string {
  return createHash("sha256").update(normalizeResumeText(text)).digest("hex");
}

async function matchRolesForResume(ctx: AuthContext, resumeText: string) {
  const jobWhere = await jobsWhereClause(ctx);
  const jobs = await db.job.findMany({
    where: jobWhere,
    select: { id: true, title: true, requirements: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return jobs
    .map((job) => ({
      jobId: job.id,
      jobTitle: job.title,
      estimatedFit: estimateRoleFitHeuristic(resumeText, job.requirements) ?? 0,
    }))
    .filter((r) => r.estimatedFit > 0)
    .sort((a, b) => b.estimatedFit - a.estimatedFit)
    .slice(0, 3);
}

export async function importResumesToTalentPool(
  ctx: AuthContext,
  files: File[]
): Promise<TalentPoolImportRow[]> {
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const batchEmails = new Set<string>();
  const batchHashes = new Set<string>();
  const results: TalentPoolImportRow[] = [];

  for (const file of files) {
    try {
      const parsed = await resumeParseService.parseResumeUpload(ctx, file);
      const email = extractEmailFromResume(parsed.text);
      const name = resolveCandidateDisplayName(parsed.text, file.name);
      const hash = resumeContentHash(parsed.text);

      if (email) {
        if (batchEmails.has(email)) {
          results.push({
            status: "failed",
            fileName: file.name,
            error: "Duplicate email in this upload",
            code: "DUPLICATE_BATCH",
          });
          continue;
        }
        batchEmails.add(email);
      }

      if (batchHashes.has(hash)) {
        results.push({
          status: "failed",
          fileName: file.name,
          error: "Duplicate resume content in this upload",
          code: "DUPLICATE_BATCH",
        });
        continue;
      }
      batchHashes.add(hash);

      const existing = email
        ? await db.candidate.findFirst({
            where: { organizationId, email: email.toLowerCase() },
          })
        : null;

      if (existing) {
        const suggestedRoles = await matchRolesForResume(ctx, parsed.text);
        results.push({
          status: "duplicate",
          fileName: file.name,
          candidateId: existing.id,
          candidateName: existing.name,
          suggestedRoles,
          message: "Candidate already exists in your talent pool",
        });
        continue;
      }

      const created = await candidateService.createCandidate(ctx, {
        name,
        email: email ?? undefined,
        resumeText: parsed.text,
        sourceFileName: parsed.fileName,
        linkedInUrl: parsed.suggestedLinkedInUrl,
        githubUrl: parsed.suggestedGithubUrl,
        portfolioUrl: parsed.suggestedPortfolioUrl,
      });

      const suggestedRoles = await matchRolesForResume(ctx, parsed.text);

      results.push({
        status: "created",
        fileName: file.name,
        candidateId: created.id,
        candidateName: created.name,
        suggestedRoles,
      });
    } catch (error: unknown) {
      if (isAppError(error)) {
        results.push({
          status: "failed",
          fileName: file.name,
          error: error.message,
          code: error.code,
        });
        continue;
      }
      results.push({
        status: "failed",
        fileName: file.name,
        error: "Failed to import resume",
        code: "IMPORT_FAILED",
      });
    }
  }

  return results;
}

export async function importResumesBulk(
  ctx: AuthContext,
  files: File[],
  options: { jobId?: string }
): Promise<BulkImportRowResult[] | TalentPoolImportRow[]> {
  if (options.jobId) {
    await getJobById(ctx, options.jobId);
    return importResumesForJob(ctx, options.jobId, files);
  }
  return importResumesToTalentPool(ctx, files);
}
