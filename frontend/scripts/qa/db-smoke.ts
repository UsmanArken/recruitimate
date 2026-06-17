import { PrismaClient } from "@prisma/client";
import {
  PLATFORM_SUPER_ADMIN_ROLE_CODE,
  seedSuperAdminEmail,
} from "../../src/lib/auth/platform-admin";

const prisma = new PrismaClient();

type Check = { name: string; ok: boolean; detail?: string };

async function main(): Promise<Check[]> {
  const checks: Check[] = [];

  await prisma.$connect();
  checks.push({ name: "Database connection", ok: true });

  const roleCount = await prisma.role.count();
  checks.push({
    name: "Roles seeded",
    ok: roleCount >= 5,
    detail: `found ${roleCount}`,
  });

  const platformRole = await prisma.role.findUnique({
    where: { code: PLATFORM_SUPER_ADMIN_ROLE_CODE },
  });
  checks.push({
    name: "PLATFORM_SUPER_ADMIN role",
    ok: Boolean(platformRole),
  });

  const permissionCount = await prisma.permission.count();
  checks.push({
    name: "Permissions seeded",
    ok: permissionCount >= 20,
    detail: `found ${permissionCount}`,
  });

  const adminEmail = seedSuperAdminEmail();
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  checks.push({
    name: `Platform admin user (${adminEmail})`,
    ok: Boolean(adminUser?.isPlatformAdmin && adminUser.passwordHash),
    detail: adminUser
      ? undefined
      : "Run npm run db:seed or npm run db:bootstrap-admin",
  });

  return checks;
}

main()
  .then((checks) => {
    let failed = 0;
    for (const c of checks) {
      if (c.ok) {
        console.log(`✓ ${c.name}${c.detail ? ` (${c.detail})` : ""}`);
      } else {
        failed += 1;
        console.error(`✗ ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
      }
    }
    if (failed > 0) process.exit(1);
  })
  .catch((e) => {
    console.error("✗ Database smoke failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
