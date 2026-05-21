import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  PLATFORM_SUPER_ADMIN_ROLE_CODE,
  SYSTEM_ORG_SLUG,
  configuredSuperAdminEmail,
  ensurePlatformAdminUser,
  syncPlatformAdminOnLogin,
} from "@/lib/auth/platform-admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const reserved = configuredSuperAdminEmail();
        const envPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();

        // Keep platform admin in sync with .env (no manual re-seed after changing email/password)
        if (reserved && email === reserved && envPassword) {
          await ensurePlatformAdminUser({
            email,
            password: envPassword,
            name: "Platform Super Admin",
          });
        }

        const user = await db.user.findUnique({
          where: { email },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      if (token.sub) {
        await syncPlatformAdminOnLogin(token.sub as string);

        const user = await db.user.findUnique({
          where: { id: token.sub as string },
          include: {
            memberships: {
              include: { role: true, organization: true },
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (user) {
          token.isPlatformAdmin = user.isPlatformAdmin;
          const systemMember = user.memberships.find(
            (m) => m.organization.slug === SYSTEM_ORG_SLUG
          );
          const member = user.isPlatformAdmin
            ? systemMember ?? user.memberships[0]
            : user.memberships[0];
          if (member) {
            token.organizationId = member.organizationId;
            token.roleId = member.roleId;
            token.roleCode = user.isPlatformAdmin
              ? PLATFORM_SUPER_ADMIN_ROLE_CODE
              : member.role.code;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.roleCode = token.roleCode as string | undefined;
        session.user.isPlatformAdmin = Boolean(token.isPlatformAdmin);
      }
      return session;
    },
  },
  trustHost: true,
};
