import type { Prisma } from "@prisma/client";

export const candidateListInclude = {
  job: true,
  talentProfile: true,
  decision: true,
} satisfies Prisma.CandidateInclude;

export const candidateDetailInclude = {
  job: true,
  talentProfile: true,
  decision: true,
  interviews: { include: { analysis: true }, orderBy: { createdAt: "desc" as const } },
  notes: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.CandidateInclude;

export const candidateWithJobAndInterviewsInclude = {
  job: true,
  interviews: { include: { analysis: true }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.CandidateInclude;

export const candidateWithTalentInclude = {
  talentProfile: true,
  job: true,
} satisfies Prisma.CandidateInclude;

export const jobListInclude = {
  _count: { select: { candidates: true } },
} satisfies Prisma.JobInclude;
