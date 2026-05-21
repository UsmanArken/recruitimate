# Authentication & ACL (database rule engine)

## Platform super admin (SaaS operator)

| Code | Name | Scope |
|------|------|--------|
| `PLATFORM_SUPER_ADMIN` | Platform Super Admin | Cross-tenant (`RoleScope.PLATFORM`) |

- Flag: `User.isPlatformAdmin` (never set by public `/signup`).
- Internal org: slug `recruitimate-platform` (operator workspace, excluded from tenant list on `/admin`).
- Bypasses org-scoped ACL and sees **all** jobs/candidates across tenants.
- Console: `/admin` (organizations, platform stats).

### Bootstrap (both methods)

1. **Seed / script** (local, staging, first deploy):

```bash
npm run db:push
npm run db:seed              # creates roles + default super admin user
# or re-run admin only:
npm run db:bootstrap-admin
```

Defaults from `.env` (or built-in fallbacks):

- `SUPER_ADMIN_EMAIL` → default `admin@recruitimate.local`
- `SUPER_ADMIN_PASSWORD` → default `ChangeMeInProduction!12`

2. **Env promotion on login** (production):

Set `SUPER_ADMIN_EMAIL` to the operator’s email. On **first successful login**, that user is promoted (`isPlatformAdmin`, system org membership, `PLATFORM_SUPER_ADMIN` role). No invite or signup for that email.

Reserved email cannot use `/signup` (`RESERVED_EMAIL`).

## Organization roles (4 + job interviewer)

| Code | Name | Scope |
|------|------|--------|
| `ORG_OWNER` | Organization Owner | Full org access (no `platform.*`) |
| `ORG_ADMIN` | Organization Admin | Manage members + all hiring data |
| `RECRUITER` | Recruiter | Org-wide pipeline & intelligence |
| `HIRING_MANAGER` | Hiring Manager | Assigned jobs / managed requisitions |

## Job-level interviewer (database role `JOB_INTERVIEWER`)

Interviewers are not a separate org signup role. Assign users on **Open roles → job detail → Job team** (`/jobs/[id]`). Use `JobAssignment.assignmentRole = INTERVIEWER` or `HIRING_MANAGER`. Permissions are loaded from the **`JOB_INTERVIEWER` role** in the `Role` + `RolePermission` tables (full decision layer included).

## Database tables

- `Permission` — `code` e.g. `candidates.read_all`, `platform.admin`
- `Role` — org, job, or platform scope
- `RolePermission` — many-to-many (**this is the rule engine**)
- `OrganizationMember` — user ↔ org ↔ role
- `JobAssignment` — user ↔ job ↔ INTERVIEWER | HIRING_MANAGER
- `User.isPlatformAdmin` — platform operator flag

## Checking permissions

```typescript
await assertPermission(ctx, { resource: "candidates", action: "read", jobId });
```

Effective permissions = org role permissions ∪ job interviewer permissions (from DB). Platform super admin: all permissions.

## Auth flows

| Flow | Path |
|------|------|
| Platform bootstrap | `db:seed` / `db:bootstrap-admin` + `/login` |
| Env promote on login | `SUPER_ADMIN_EMAIL` + `/login` |
| Customer self signup | `/signup` → creates org + `ORG_OWNER` |
| Sign in | `/login` |
| Invite | `/settings/team` → link `/invite/[token]` |
| Accept invite | Creates member with invited role |

## Setup

```bash
npm run db:push
npm run db:seed
```

Set `AUTH_SECRET`, `AUTH_URL`, and platform admin vars in `.env`.

**Important:** Changing `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env` and restarting the dev server does **not** update the database by itself. Either:

- Sign in once (login auto-syncs the platform admin from `.env`), or
- Run `npm run db:bootstrap-admin` or `npm run db:seed`

Login password must match `SUPER_ADMIN_PASSWORD` in `.env` (minimum 8 characters).

## Migrating existing data

If you had pre-auth candidates/jobs, reset DB or attach rows to an `organizationId` manually before enforcing auth.
