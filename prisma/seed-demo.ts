import { PrismaClient, InterviewStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  demoEmail,
  demoPassword,
} from "../src/lib/demo/constants";
import { DEMO_CANDIDATES, DEMO_JOBS } from "../src/lib/demo/seed-data";

const prisma = new PrismaClient();

async function resetDemoWorkspace() {
  const email = demoEmail();
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: DEMO_ORG_SLUG },
  });
  if (existingOrg) {
    await prisma.organization.delete({ where: { id: existingOrg.id } });
    console.log(`Removed existing demo organization (${DEMO_ORG_SLUG}).`);
  }

  await prisma.user.deleteMany({ where: { email } });
}

async function seedDemoWorkspace() {
  const ownerRole = await prisma.role.findUnique({ where: { code: "ORG_OWNER" } });
  if (!ownerRole) {
    throw new Error("Roles not seeded. Run: npm run db:seed");
  }

  const email = demoEmail();
  const passwordHash = await bcrypt.hash(demoPassword(), 12);
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() - 3);

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: DEMO_ORG_NAME, slug: DEMO_ORG_SLUG },
    });

    const user = await tx.user.create({
      data: {
        email,
        name: "Demo Recruiter",
        passwordHash,
        isPlatformAdmin: false,
      },
    });

    await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roleId: ownerRole.id,
      },
    });

    const jobIds = new Map<string, string>();
    for (const job of DEMO_JOBS) {
      const created = await tx.job.create({
        data: {
          organizationId: organization.id,
          title: job.title,
          description: job.description,
          requirements: job.requirements,
          hiringManagerId: user.id,
        },
      });
      jobIds.set(job.key, created.id);
    }

    for (const spec of DEMO_CANDIDATES) {
      const jobId = jobIds.get(spec.jobKey);
      if (!jobId) {
        throw new Error(`Unknown job key: ${spec.jobKey}`);
      }

      const candidate = await tx.candidate.create({
        data: {
          organizationId: organization.id,
          name: spec.name,
          email: spec.email,
          linkedInUrl: spec.linkedInUrl,
          resumeText: spec.resumeText,
        },
      });

      const application = await tx.jobApplication.create({
        data: {
          organizationId: organization.id,
          candidateId: candidate.id,
          jobId,
          stage: spec.stage,
        },
      });

      if (spec.talent) {
        await tx.talentProfile.create({
          data: {
            applicationId: application.id,
            skills: spec.talent.skills,
            experienceYears: spec.talent.experienceYears,
            roleFitScore: spec.talent.roleFitScore,
            strengths: spec.talent.strengths,
            gaps: spec.talent.gaps,
            hiddenSignals: spec.talent.hiddenSignals,
            explanation: spec.talent.explanation,
          },
        });
      }

      if (spec.interview) {
        const interview = await tx.interview.create({
          data: {
            applicationId: application.id,
            title: spec.interview.title,
            status: InterviewStatus.ANALYZED,
            scheduledAt,
            durationMinutes: 55,
            meetingUrl: "https://meet.example.com/acme-demo-interview",
            transcript: spec.interview.transcript,
            audioSignals: {
              pauseDensity: 0.12,
              toneShifts: 2,
              summary: "Steady pace with brief pauses before system-design answers.",
            },
          },
        });

        await tx.interviewAnalysis.create({
          data: {
            interviewId: interview.id,
            hesitationScore: spec.interview.analysis.hesitationScore,
            confidenceScore: spec.interview.analysis.confidenceScore,
            clarityScore: spec.interview.analysis.clarityScore,
            consistencyScore: spec.interview.analysis.consistencyScore,
            engagementScore: spec.interview.analysis.engagementScore,
            cognitiveSignals: spec.interview.analysis.cognitiveSignals,
            behavioralMetrics: spec.interview.analysis.behavioralMetrics,
            riskFlags: spec.interview.analysis.riskFlags,
            explanation: spec.interview.analysis.explanation,
            interviewerQuality: spec.interview.analysis.interviewerQuality,
          },
        });
      }

      if (spec.decision) {
        await tx.decision.create({
          data: {
            applicationId: application.id,
            hireConfidence: spec.decision.hireConfidence,
            recommendation: spec.decision.recommendation,
            riskFactors: spec.decision.riskFactors,
            comparisonNotes: spec.decision.comparisonNotes,
            explanation: spec.decision.explanation,
            signalBreakdown: spec.decision.signalBreakdown,
          },
        });
      }
    }
  });
}

async function main() {
  console.log("Seeding demo workspace…");
  await resetDemoWorkspace();
  await seedDemoWorkspace();
  console.log("");
  console.log("Demo workspace ready.");
  console.log(`  Organization: ${DEMO_ORG_NAME} (${DEMO_ORG_SLUG})`);
  console.log(`  Login email:  ${demoEmail()}`);
  console.log(`  Password:     ${demoPassword()}`);
  console.log("");
  console.log("Use “Go to Demo” on the login page or sign in with the credentials above.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
