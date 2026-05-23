import { db } from "@/lib/db";
import { assertPermission } from "@/lib/auth/permission.service";
import {
  metricsApplicationsWhereClause,
  metricsJobsWhereClause,
} from "@/lib/auth/scope.service";
import { isPlatformReadOnlyWorkspace } from "@/lib/auth/platform-admin";
import type { AuthContext } from "@/lib/auth/types";

export type WorkspaceOnboarding = {
  jobCount: number;
  applicationCount: number;
  interviewedCount: number;
  isNewWorkspace: boolean;
  steps: {
    postRole: boolean;
    addCandidate: boolean;
    completeInterview: boolean;
  };
};

export async function getWorkspaceOnboarding(ctx: AuthContext): Promise<WorkspaceOnboarding> {
  await assertPermission(ctx, { resource: "candidates", action: "read" });

  if (isPlatformReadOnlyWorkspace(ctx)) {
    return {
      jobCount: 0,
      applicationCount: 0,
      interviewedCount: 0,
      isNewWorkspace: false,
      steps: { postRole: true, addCandidate: true, completeInterview: true },
    };
  }

  const [jobWhere, applicationWhere] = await Promise.all([
    metricsJobsWhereClause(ctx),
    metricsApplicationsWhereClause(ctx),
  ]);

  const [jobCount, applicationCount, interviewedCount] = await Promise.all([
    db.job.count({ where: jobWhere }),
    db.jobApplication.count({ where: applicationWhere }),
    db.jobApplication.count({
      where: { ...applicationWhere, stage: "INTERVIEWED" },
    }),
  ]);

  return {
    jobCount,
    applicationCount,
    interviewedCount,
    isNewWorkspace: jobCount === 0 && applicationCount === 0,
    steps: {
      postRole: jobCount > 0,
      addCandidate: applicationCount > 0,
      completeInterview: interviewedCount > 0,
    },
  };
}
