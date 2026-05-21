export type AuthContext = {
  userId: string;
  organizationId: string;
  memberId: string;
  roleId: string;
  roleCode: string;
  userEmail: string;
  userName: string | null;
};

export type PermissionCheck = {
  resource: string;
  action: string;
  jobId?: string;
};
