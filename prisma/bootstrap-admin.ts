import {
  ensurePlatformAdminUser,
  seedSuperAdminEmail,
  seedSuperAdminPassword,
} from "../src/lib/auth/platform-admin";

async function main() {
  const email = seedSuperAdminEmail();
  const password = seedSuperAdminPassword();
  const result = await ensurePlatformAdminUser({
    email,
    password,
    name: "Platform Super Admin",
  });
  console.log(`Platform super admin bootstrapped: ${email}`);
  console.log(`User id: ${result.userId}, system org id: ${result.organizationId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { db } = await import("../src/lib/db");
    await db.$disconnect();
  });
