import { PrismaClient, RoleScope } from "@prisma/client";
import {
  ensurePlatformAdminUser,
  seedSuperAdminEmail,
  seedSuperAdminPassword,
} from "../src/lib/auth/platform-admin";

const prisma = new PrismaClient();

const PERMISSIONS: { code: string; resource: string; action: string; description: string }[] = [
  { code: "platform.admin", resource: "platform", action: "admin", description: "Full platform administration" },
  { code: "platform.orgs.read", resource: "platform", action: "orgs_read", description: "View all tenant organizations" },
  { code: "org.read", resource: "org", action: "read", description: "View organization" },
  { code: "org.update", resource: "org", action: "update", description: "Update organization settings" },
  { code: "members.read", resource: "members", action: "read", description: "View team members" },
  { code: "members.invite", resource: "members", action: "invite", description: "Invite users" },
  { code: "members.update", resource: "members", action: "update", description: "Change member roles" },
  { code: "members.delete", resource: "members", action: "delete", description: "Remove members" },
  { code: "jobs.create", resource: "jobs", action: "create", description: "Create jobs" },
  { code: "jobs.read", resource: "jobs", action: "read", description: "View jobs" },
  { code: "jobs.read_all", resource: "jobs", action: "read_all", description: "View all org jobs" },
  { code: "jobs.read_assigned", resource: "jobs", action: "read_assigned", description: "View assigned jobs only" },
  { code: "jobs.update", resource: "jobs", action: "update", description: "Update jobs" },
  { code: "jobs.delete", resource: "jobs", action: "delete", description: "Delete jobs" },
  { code: "candidates.create", resource: "candidates", action: "create", description: "Add candidates" },
  { code: "candidates.read", resource: "candidates", action: "read", description: "View candidates" },
  { code: "candidates.read_all", resource: "candidates", action: "read_all", description: "View all org candidates" },
  { code: "candidates.read_assigned", resource: "candidates", action: "read_assigned", description: "View candidates on assigned jobs" },
  { code: "candidates.update", resource: "candidates", action: "update", description: "Update candidates and pipeline" },
  { code: "candidates.delete", resource: "candidates", action: "delete", description: "Delete candidates" },
  { code: "interviews.create", resource: "interviews", action: "create", description: "Add interviews" },
  { code: "interviews.read", resource: "interviews", action: "read", description: "View interviews" },
  { code: "intelligence.run", resource: "intelligence", action: "run", description: "Re-run AI analysis" },
  { code: "intelligence.read", resource: "intelligence", action: "read", description: "View talent and interview intelligence" },
  { code: "outreach.read", resource: "outreach", action: "read", description: "View outreach campaigns and templates" },
  { code: "outreach.create", resource: "outreach", action: "create", description: "Create outreach campaigns and templates" },
  { code: "outreach.update", resource: "outreach", action: "update", description: "Update outreach campaigns and messages" },
  { code: "outreach.send", resource: "outreach", action: "send", description: "Send outreach and record delivery events" },
  { code: "decisions.read", resource: "decisions", action: "read", description: "View decision layer and hire recommendations" },
  { code: "learning.read", resource: "learning", action: "read", description: "View hiring outcomes, feedback, and scoring model" },
  { code: "learning.manage", resource: "learning", action: "manage", description: "Record outcomes, give feedback, and retrain scoring model" },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  PLATFORM_SUPER_ADMIN: PERMISSIONS.map((p) => p.code),
  ORG_OWNER: PERMISSIONS.filter((p) => !p.code.startsWith("platform.")).map((p) => p.code),
  ORG_ADMIN: PERMISSIONS.filter((p) => !p.code.startsWith("platform.")).map((p) => p.code),
  RECRUITER: [
    "org.read",
    "members.read",
    "jobs.create",
    "jobs.read",
    "jobs.read_all",
    "jobs.update",
    "candidates.create",
    "candidates.read",
    "candidates.read_all",
    "candidates.update",
    "interviews.create",
    "interviews.read",
    "intelligence.run",
    "intelligence.read",
    "outreach.read",
    "outreach.create",
    "outreach.update",
    "outreach.send",
    "decisions.read",
    "learning.read",
    "learning.manage",
  ],
  HIRING_MANAGER: [
    "org.read",
    "members.read",
    "jobs.read",
    "jobs.read_assigned",
    "jobs.update",
    "candidates.create",
    "candidates.read",
    "candidates.read_assigned",
    "candidates.update",
    "interviews.create",
    "interviews.read",
    "intelligence.read",
    "outreach.read",
    "outreach.create",
    "outreach.update",
    "decisions.read",
    "learning.read",
    "learning.manage",
  ],
};

/** Job-level role: interviewers on a requisition (full decision layer per product requirement) */
const JOB_ROLE_INTERVIEWER: string[] = [
  "jobs.read",
  "jobs.read_assigned",
  "candidates.read",
  "candidates.read_assigned",
  "interviews.create",
  "interviews.read",
  "intelligence.read",
  "decisions.read",
  "learning.read",
];

const ROLES: { code: string; name: string; description: string; scope: RoleScope; permissions: string[] }[] = [
  {
    code: "PLATFORM_SUPER_ADMIN",
    name: "Platform Super Admin",
    description: "SaaS operator with cross-tenant access",
    scope: RoleScope.PLATFORM,
    permissions: ROLE_PERMISSIONS.PLATFORM_SUPER_ADMIN,
  },
  {
    code: "ORG_OWNER",
    name: "Organization Owner",
    description: "Full access, billing, and ownership",
    scope: RoleScope.ORGANIZATION,
    permissions: ROLE_PERMISSIONS.ORG_OWNER,
  },
  {
    code: "ORG_ADMIN",
    name: "Organization Admin",
    description: "Manage users, settings, and all hiring data",
    scope: RoleScope.ORGANIZATION,
    permissions: ROLE_PERMISSIONS.ORG_ADMIN,
  },
  {
    code: "RECRUITER",
    name: "Recruiter",
    description: "Owns pipeline and intelligence workflows org-wide",
    scope: RoleScope.ORGANIZATION,
    permissions: ROLE_PERMISSIONS.RECRUITER,
  },
  {
    code: "HIRING_MANAGER",
    name: "Hiring Manager",
    description: "Manages assigned requisitions and hiring decisions",
    scope: RoleScope.ORGANIZATION,
    permissions: ROLE_PERMISSIONS.HIRING_MANAGER,
  },
  {
    code: "JOB_INTERVIEWER",
    name: "Interviewer (job assignment)",
    description: "Interview access on assigned jobs including full decision layer",
    scope: RoleScope.JOB,
    permissions: JOB_ROLE_INTERVIEWER,
  },
];

async function main() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      create: perm,
      update: { resource: perm.resource, action: perm.action, description: perm.description },
    });
  }

  const permissionMap = Object.fromEntries(
    (await prisma.permission.findMany()).map((p) => [p.code, p.id])
  );

  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: roleDef.code },
      create: {
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        scope: roleDef.scope,
      },
      update: {
        name: roleDef.name,
        description: roleDef.description,
        scope: roleDef.scope,
      },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });

    for (const code of roleDef.permissions) {
      const permissionId = permissionMap[code];
      if (!permissionId) {
        console.warn(`Missing permission: ${code}`);
        continue;
      }
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId },
      });
    }
  }

  console.log("Seeded permissions and roles (database ACL rules).");

  const adminEmail = seedSuperAdminEmail();
  const adminPassword = seedSuperAdminPassword();
  await ensurePlatformAdminUser({
    email: adminEmail,
    password: adminPassword,
    name: "Platform Super Admin",
  });
  console.log(`Platform super admin ready: ${adminEmail} (password from SUPER_ADMIN_PASSWORD or seed default)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
