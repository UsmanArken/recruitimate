import type { Prisma } from "@prisma/client";

export const applicationListInclude = {
  candidate: { select: { id: true, name: true, email: true } },
  job: { select: { id: true, title: true } },
  talentProfile: true,
  decision: true,
} satisfies Prisma.JobApplicationInclude;

export const applicationDetailInclude = {
  candidate: true,
  job: true,
  talentProfile: true,
  decision: true,
  interviews: { include: { analysis: true }, orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.JobApplicationInclude;

export const candidatePersonInclude = {
  applications: {
    include: {
      job: { select: { id: true, title: true } },
      talentProfile: true,
      decision: true,
    },
    orderBy: { updatedAt: "desc" as const },
  },
  notes: {
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.CandidateInclude;

export const jobListInclude = {
  _count: { select: { applications: true } },
} satisfies Prisma.JobInclude;
