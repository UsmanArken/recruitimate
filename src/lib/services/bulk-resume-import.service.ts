import { createHash } from "crypto";
import { db } from "@/lib/db";
import { applicationDetailInclude } from "@/lib/db/includes";
import { isAppError } from "@/lib/api/errors";
import { organizationFilter } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";
import { normalizeResumeText } from "@/lib/resume/extract-text";
import {
  extractEmailFromResume,
  resolveCandidateDisplayName,
} from "@/lib/resume/parse-contact";
import * as resumeParseService from "@/lib/services/resume-parse.service";
import * as candidateService from "@/lib/services/candidate.service";
import * as applicationService from "@/lib/services/application.service";
import { getJobById } from "@/lib/services/job.service";
import { buildDiscoveryDocument } from "@/lib/intelligence/talent/discovery-engine";
import type { Prisma } from "@prisma/client";

export type BulkImportRowResult =
  | {
      status: "created";
      fileName: string;
      candidateId: string;
      applicationId: string;
      candidateName: string;
      roleFitScore: number | null;
      hireConfidence: number | null;
    }
  | {
      status: "duplicate";
      fileName: string;
      candidateId: string;
      applicationId: string;
      candidateName: string;
      roleFitScore: number | null;
      hireConfidence: number | null;
      message: string;
    }
  | {
      status: "failed";
      fileName: string;
      error: string;
      code?: string;
    };

function resumeContentHash(text: string): string {
  return createHash("sha256").update(normalizeResumeText(text)).digest("hex");
}

function rowFromApplication(
  fileName: string,
  app: {
    id: string;
    candidateId: string;
    candidate: { name: string };
    talentProfile: { roleFitScore: number | null } | null;
    decision: { hireConfidence: number | null } | null;
  },
  status: "created" | "duplicate",
  message?: string
): BulkImportRowResult {
  const base = {
    fileName,
    candidateId: app.candidateId,
    applicationId: app.id,
    candidateName: app.candidate.name,
    roleFitScore: app.talentProfile?.roleFitScore ?? null,
    hireConfidence: app.decision?.hireConfidence ?? null,
  };
  if (status === "created") {
    return { status: "created", ...base };
  }
  return {
    status: "duplicate",
    ...base,
    message: message ?? "Already in pipeline for this role",
  };
}

async function findExistingApplication(
  ctx: AuthContext,
  candidateId: string,
  jobId: string
) {
  return db.jobApplication.findFirst({
    where: {
      candidateId,
      jobId,
      ...organizationFilter(ctx),
    },
    include: applicationDetailInclude,
  });
}

async function findCandidateByEmail(ctx: AuthContext, email: string) {
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  return db.candidate.findFirst({
    where: {
      organizationId,
      email: email.toLowerCase(),
    },
    include: { applications: { select: { jobId: true } } },
  });
}

async function findCandidateByResumeHash(
  ctx: AuthContext,
  normalizedResume: string,
  hash: string
) {
  const organizationId = ctx.actingOrganizationId ?? ctx.organizationId;
  const candidates = await db.candidate.findMany({
    where: {
      organizationId,
      resumeText: { not: null },
    },
    select: { id: true, resumeText: true, email: true, name: true },
    take: 500,
    orderBy: { updatedAt: "desc" },
  });

  for (const c of candidates) {
    if (!c.resumeText) continue;
    if (resumeContentHash(c.resumeText) === hash) return c;
    if (normalizeResumeText(c.resumeText) === normalizedResume) return c;
  }
  return null;
}

export async function importResumesForJob(
  ctx: AuthContext,
  jobId: string,
  files: File[]
): Promise<BulkImportRowResult[]> {
  await getJobById(ctx, jobId);

  const batchEmails = new Set<string>();
  const batchHashes = new Set<string>();
  const results: BulkImportRowResult[] = [];

  for (const file of files) {
    try {
      const parsed = await resumeParseService.parseResumeUpload(ctx, file);
      const email = extractEmailFromResume(parsed.text);
      const name = resolveCandidateDisplayName(parsed.text, file.name);
      const normalized = normalizeResumeText(parsed.text);
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

      let candidate =
        (email ? await findCandidateByEmail(ctx, email) : null) ??
        (await findCandidateByResumeHash(ctx, normalized, hash));

      if (candidate) {
        const existingApp = await findExistingApplication(ctx, candidate.id, jobId);
        if (existingApp) {
          results.push(
            rowFromApplication(
              file.name,
              existingApp,
              "duplicate",
              "This candidate is already in review for this role"
            )
          );
          continue;
        }

        if (!candidate.resumeText || candidate.resumeText.length < 20) {
          const doc = buildDiscoveryDocument({
            name: candidate.name,
            resumeText: parsed.text,
          });
          await db.candidate.update({
            where: { id: candidate.id },
            data: {
              resumeText: parsed.text,
              name: candidate.name || name,
              email: candidate.email ?? email ?? null,
              source: "BULK",
              searchDocument: doc.searchDocument,
              searchSkills: doc.searchSkills as Prisma.InputJsonValue,
              discoveryIndexedAt: new Date(),
            },
          });
        }

        const app = await applicationService.createApplicationForCandidate(
          ctx,
          candidate.id,
          jobId
        );
        results.push(rowFromApplication(file.name, app, "created"));
        continue;
      }

      const created = await candidateService.createCandidate(ctx, {
        name,
        email: email ?? undefined,
        jobId,
        resumeText: parsed.text,
        linkedInText: undefined,
        linkedInUrl: undefined,
        githubUrl: undefined,
      });

      await db.candidate.update({
        where: { id: created.id },
        data: { source: "BULK" },
      });

      const app = created.applications?.[0];
      if (!app?.id) {
        results.push({
          status: "failed",
          fileName: file.name,
          error: "Could not create application for this role",
          code: "NO_APPLICATION",
        });
        continue;
      }

      const full = await db.jobApplication.findFirst({
        where: { id: app.id },
        include: applicationDetailInclude,
      });
      if (!full) {
        results.push({
          status: "failed",
          fileName: file.name,
          error: "Application was created but could not be loaded",
          code: "LOAD_FAILED",
        });
        continue;
      }

      results.push(rowFromApplication(file.name, full, "created"));
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
