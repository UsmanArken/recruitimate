import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { badRequest } from "@/lib/api/errors";
import { isReservedSuperAdminEmail } from "@/lib/auth/platform-admin";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "workspace";
}

async function uniqueSlug(name: string): Promise<string> {
  let slug = slugify(name);
  let n = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(name)}-${n}`;
  }
  return slug;
}

export async function signupWithOrganization(input: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) {
  const email = input.email.toLowerCase();
  if (isReservedSuperAdminEmail(email)) {
    throw badRequest(
      "This email is reserved for platform administration. Sign in after running db:seed or contact your operator.",
      "RESERVED_EMAIL"
    );
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw badRequest("Email already registered", "EMAIL_EXISTS");

  const ownerRole = await db.role.findUnique({ where: { code: "ORG_OWNER" } });
  if (!ownerRole) {
    throw badRequest("Roles not seeded. Run npm run db:seed", "ROLES_MISSING");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const slug = await uniqueSlug(input.organizationName);

  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
      },
    });

    const organization = await tx.organization.create({
      data: {
        name: input.organizationName,
        slug,
      },
    });

    await tx.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        roleId: ownerRole.id,
      },
    });

    return { user, organization };
  });
}
