export type AuthContext = {
  userId: string;
  organizationId: string;
  memberId: string;
  roleId: string;
  roleCode: string;
  userEmail: string;
  userName: string | null;
  /** Cross-tenant platform operator (SaaS super admin). */
  isPlatformAdmin: boolean;
  /** When set, platform admin may write hiring data for this tenant (impersonation). */
  actingOrganizationId?: string | null;
};

export type PermissionCheck = {
  resource: string;
  action: string;
  jobId?: string;
};
