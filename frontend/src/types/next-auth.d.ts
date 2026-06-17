import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      organizationId?: string;
      roleCode?: string;
      isPlatformAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string;
    roleCode?: string;
    roleId?: string;
    isPlatformAdmin?: boolean;
  }
}
