/**
 * One-time data migration for existing databases (Candidate.jobId era).
 *
 * 1. npm run db:migrate-applications   (while old columns still exist)
 * 2. npm run db:push                   (applies JobApplication schema)
 *
 * Fresh dev DB with no legacy rows: `npm run db:push` only.
 * Dev reset: `npx prisma db push --force-reset` then `npm run db:seed`.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
  `;
  return rows.length > 0;
}

async function main() {
  const hasLegacyJobId = await columnExists("Candidate", "jobId");
  if (!hasLegacyJobId) {
    console.log("No Candidate.jobId — legacy migration not needed.");
    return;
  }

  const hasApplicationTable = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'JobApplication'
    ) AS exists
  `;

  if (!hasApplicationTable[0]?.exists) {
    console.log(
      "JobApplication table missing. Run `npm run db:push` first (may require backup), or use `npx prisma db push --force-reset` on dev."
    );
    process.exit(1);
  }

  type LegacyCandidate = {
    id: string;
    organizationId: string;
    jobId: string;
    stage: string;
  };

  const candidates = await prisma.$queryRaw<LegacyCandidate[]>`
    SELECT id, "organizationId", "jobId", stage::text AS stage
    FROM "Candidate" WHERE "jobId" IS NOT NULL
  `;

  for (const c of candidates) {
    const app = await prisma.jobApplication.upsert({
      where: { candidateId_jobId: { candidateId: c.id, jobId: c.jobId } },
      create: {
        organizationId: c.organizationId,
        candidateId: c.id,
        jobId: c.jobId,
        stage: c.stage as "NEW",
      },
      update: {},
    });

    if (await columnExists("TalentProfile", "candidateId")) {
      await prisma.$executeRaw`
        UPDATE "TalentProfile" SET "applicationId" = ${app.id}
        WHERE "candidateId" = ${c.id} AND ("applicationId" IS NULL OR "applicationId" = '')
      `;
    }
    if (await columnExists("Decision", "candidateId")) {
      await prisma.$executeRaw`
        UPDATE "Decision" SET "applicationId" = ${app.id}
        WHERE "candidateId" = ${c.id} AND ("applicationId" IS NULL OR "applicationId" = '')
      `;
    }
    if (await columnExists("Interview", "candidateId")) {
      await prisma.$executeRaw`
        UPDATE "Interview" SET "applicationId" = ${app.id}
        WHERE "candidateId" = ${c.id} AND ("applicationId" IS NULL OR "applicationId" = '')
      `;
    }
  }

  console.log(`Linked ${candidates.length} candidate(s) to JobApplication rows.`);
  console.log("Next: npm run db:push");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
