# Recruitimate — Authentication & RBAC

**Role-Based Access Control (RBAC)** for Recruitimate is enforced **server-side** from database rules — not hard-coded in the UI.

- Permissions are stored in `Permission` + `RolePermission` tables.
- Users get **one organization role** (`OrganizationMember.roleId`).
- **Job-level** access is granted via `JobAssignment` or by being the job’s `hiringManagerId`.
- There is **no per-user feature toggle UI** today — you assign **roles**, not individual permission checkboxes.

**Source of truth (code):** `prisma/seed.ts` (`PERMISSIONS`, `ROLE_PERMISSIONS`, `JOB_ROLE_INTERVIEWER`).  
Re-run `npm run db:seed` after changing seed rules.

---

## 1. Roles at a glance

| Code | Name | Scope | Who gets it | Typical use |
|------|------|--------|-------------|-------------|
| `PLATFORM_SUPER_ADMIN` | Platform Super Admin | Platform | `User.isPlatformAdmin` + seed/bootstrap | SaaS operator; `/admin` |
| `ORG_OWNER` | Organization Owner | Organization | First `/signup` user; manual DB only otherwise | Full tenant control |
| `ORG_ADMIN` | Organization Admin | Organization | Invite | Manage team + all hiring data |
| `RECRUITER` | Recruiter | Organization | Invite (default) | Org-wide pipeline & intelligence |
| `HIRING_MANAGER` | Hiring Manager | Organization | Invite | Assigned / managed jobs only |
| `JOB_INTERVIEWER` | Interviewer | Job | Job team assignment (`INTERVIEWER`) | Interview + decision on assigned jobs |

### Role descriptions

| Role | Summary |
|------|---------|
| **Owner** | All organization permissions. Cannot invite another owner via UI. Last owner cannot be demoted. |
| **Admin** | Same permission set as owner in the database. Cannot assign owner role unless you are owner. |
| **Recruiter** | Create/edit jobs and candidates org-wide; run intelligence; no member invite or delete. |
| **Hiring Manager** | Sees only **assigned** jobs and their candidates; can update pipeline on those jobs. |
| **Interviewer** | Not an org signup role. Added per job; gets read + interview + decision on that job when `assignmentRole = INTERVIEWER`. |

---

## 2. Permission catalog

All permission codes follow `{resource}.{action}`.

| Code | Resource | Action | Description |
|------|----------|--------|-------------|
| `platform.admin` | platform | admin | Full platform administration |
| `platform.orgs.read` | platform | orgs_read | View all tenant organizations |
| `org.read` | org | read | View organization |
| `org.update` | org | update | Update organization settings |
| `members.read` | members | read | View team members |
| `members.invite` | members | invite | Invite users |
| `members.update` | members | update | Change member roles |
| `members.delete` | members | delete | Remove members |
| `jobs.create` | jobs | create | Create open roles |
| `jobs.read` | jobs | read | View jobs (scoped) |
| `jobs.read_all` | jobs | read_all | View all jobs in the organization |
| `jobs.read_assigned` | jobs | read_assigned | View assigned jobs only |
| `jobs.update` | jobs | update | Edit jobs |
| `jobs.delete` | jobs | delete | Delete open roles |
| `candidates.create` | candidates | create | Add candidates |
| `candidates.read` | candidates | read | View candidates (scoped) |
| `candidates.read_all` | candidates | read_all | View all candidates in the organization |
| `candidates.read_assigned` | candidates | read_assigned | View candidates on assigned jobs |
| `candidates.update` | candidates | update | Update candidates, pipeline, recruiter reviews |
| `candidates.delete` | candidates | delete | Delete candidates |
| `interviews.create` | interviews | create | Schedule interviews, submit transcripts |
| `interviews.read` | interviews | read | View interview data and analysis |
| `intelligence.run` | intelligence | run | Re-run AI talent/decision analysis |
| `intelligence.read` | intelligence | read | View talent and interview intelligence |
| `decisions.read` | decisions | read | View decision layer and hire recommendations |

---

## 3. Permission matrix by role

Legend: **✓** = granted · **—** = not granted

| Permission | Platform Super Admin | Owner | Admin | Recruiter | Hiring Manager | Job Interviewer* |
|------------|:--------------------:|:-----:|:-----:|:---------:|:--------------:|:----------------:|
| `platform.admin` | ✓ | — | — | — | — | — |
| `platform.orgs.read` | ✓ | — | — | — | — | — |
| `org.read` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `org.update` | ✓ | ✓ | ✓ | — | — | — |
| `members.read` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `members.invite` | ✓ | ✓ | ✓ | — | — | — |
| `members.update` | ✓ | ✓ | ✓ | — | — | — |
| `members.delete` | ✓ | ✓ | ✓ | — | — | — |
| `jobs.create` | ✓ | ✓ | ✓ | ✓ | — | — |
| `jobs.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `jobs.read_all` | ✓ | ✓ | ✓ | ✓ | — | — |
| `jobs.read_assigned` | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| `jobs.update` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `jobs.delete` | ✓ | ✓ | ✓ | — | — | — |
| `candidates.create` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `candidates.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `candidates.read_all` | ✓ | ✓ | ✓ | ✓ | — | — |
| `candidates.read_assigned` | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| `candidates.update` | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `candidates.delete` | ✓ | ✓ | ✓ | — | — | — |
| `interviews.create` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `interviews.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `intelligence.run` | ✓ | ✓ | ✓ | ✓ | — | — |
| `intelligence.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `decisions.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

\* **Job Interviewer** permissions apply **only on jobs where the user is assigned** with `JobAssignment.assignmentRole = INTERVIEWER`. They are **merged** with the user’s organization role at runtime.

**Owner vs Admin:** Identical rows in the matrix above. Business rules (owner invite limits, last-owner protection) are enforced in application code, not by different permission sets.

---

## 4. Data scoping (what users actually see)

Permissions alone are not enough — **list queries are scoped** in `src/lib/auth/scope.service.ts`.

### Org-wide vs assigned-only

| Permission | Effect on lists |
|------------|-----------------|
| `jobs.read_all` | All jobs in the organization |
| `jobs.read_assigned` only | Jobs where user is `hiringManagerId` **or** has a `JobAssignment` |
| `candidates.read_all` | All applications/candidates in the organization |
| `candidates.read_assigned` only | Candidates with at least one application on an accessible job |

**Recruiter** and **Owner/Admin** use `read_all` → see the full org pipeline.  
**Hiring Manager** uses `read_assigned` → sees only their jobs and related candidates.

### Assigned job IDs

A user can access a job if any of the following is true:

1. They have `jobs.read_all`, **or**
2. They are `Job.hiringManagerId` for that job, **or**
3. They have a `JobAssignment` row for that job (`HIRING_MANAGER` or `INTERVIEWER`).

### Platform super admin

- **Cross-tenant read** when browsing (all organizations).
- **Hiring writes blocked** in operator workspace unless impersonating a tenant (`TENANT_CONTEXT_REQUIRED`).
- Customer metrics exclude internal org `recruitimate-platform`.

---

## 5. Job-level access (interviewers)

Interviewers are **not** invited with an “Interviewer” org role.

1. Invite user as **Recruiter**, **Hiring Manager**, or **Admin** (or they are already a member).
2. Open **Open roles → [job] → Job team**.
3. Assign user with role **Interviewer**.

When `assignmentRole === INTERVIEWER`, the app loads permissions from the **`JOB_INTERVIEWER`** role and **merges** them with the user’s org role for checks on that `jobId`:

```typescript
// permission.service.ts — effective permissions
orgRolePermissions ∪ jobInterviewerPermissions (when assigned as INTERVIEWER on jobId)
```

**Product rule:** Interviewers can view the **full decision layer** (`decisions.read`) on jobs they are assigned to.

`JobAssignment.assignmentRole = HIRING_MANAGER` grants **job access** via `getAssignedJobIds` but does **not** merge the `JOB_INTERVIEWER` permission bundle.

---

## 6. Platform super admin (SaaS operator)

| Code | Name | Scope |
|------|------|--------|
| `PLATFORM_SUPER_ADMIN` | Platform Super Admin | `RoleScope.PLATFORM` |

| Property | Value |
|----------|--------|
| Flag | `User.isPlatformAdmin` (never set by public `/signup`) |
| Internal org | slug `recruitimate-platform` (hidden from tenant list & customer metrics) |
| Home after login | `/admin` |
| Browse mode | `/candidates?operatorBrowse=1` — read-only hiring UI (8h cookie) |
| Writes in browse mode | Blocked — `403 TENANT_CONTEXT_REQUIRED` |
| Permissions | All codes in the catalog (including `platform.*`) |

### Bootstrap

1. **Seed / script** (local, staging, first deploy):

```bash
npm run db:push
npm run db:seed              # roles, permissions, default super admin
# or admin only:
npm run db:bootstrap-admin
```

2. **Env promotion on login** (production): set `SUPER_ADMIN_EMAIL`. On first successful login, that user is promoted. Reserved email cannot `/signup`.

Defaults from `.env`:

- `SUPER_ADMIN_EMAIL` → `admin@recruitimate.local` (seed fallback)
- `SUPER_ADMIN_PASSWORD` → `ChangeMeInProduction!12` (seed fallback)

Production example: `superadmin@recruitimate.io`.

---

## 7. Managing team & roles (UI)

| Action | Path | Required permission | Notes |
|--------|------|---------------------|-------|
| View members | `/settings/team` | `members.read` | Table always shown (empty state if solo) |
| View role permissions | `/settings/team` → RBAC section | `members.read` | From `GET /api/roles/permissions` |
| Invite teammate | `/settings/team` | `members.invite` | Roles: Admin, Recruiter, Hiring Manager only |
| Change member role | `/settings/team` dropdown | `members.update` | Owner row not editable in UI |
| Accept invite | `/invite/[token]` | — | Joins org with invited role |
| Assign job interviewer | `/jobs/[id]` job team | `jobs.update` | Adds `JobAssignment` |

### Invite rules (`invite.service.ts`)

- Invitable org roles: `ORG_ADMIN`, `RECRUITER`, `HIRING_MANAGER`
- **Cannot invite** `ORG_OWNER` (second owner must be promoted manually / by existing owner)
- Invite expires after **7 days**

### Role change rules (`member.service.ts`)

- Cannot change **your own** role if you are the only owner
- Only **owners** can assign `ORG_OWNER` to someone else
- Cannot demote the **last** owner in the organization

---

## 8. Database model

```
Permission (code, resource, action, description)
    ↕ RolePermission
Role (code, name, scope: ORGANIZATION | JOB | PLATFORM)
    ↕ OrganizationMember (user ↔ org ↔ role)
    ↕ Invite (pending member ↔ role)

JobAssignment (user ↔ job ↔ HIRING_MANAGER | INTERVIEWER)
Job.hiringManagerId → User (implicit job access)

User.isPlatformAdmin → platform operator flag
```

| Table | Purpose |
|-------|---------|
| `Permission` | Atomic capability, e.g. `candidates.update` |
| `Role` | Named bundle of permissions |
| `RolePermission` | **Rule engine** — which permissions each role has |
| `OrganizationMember` | User’s **organization role** |
| `JobAssignment` | Per-job team membership |
| `Invite` | Pending org membership with pre-selected role |

---

## 9. Enforcement in code

### Permission check (services / API routes)

```typescript
import { assertPermission } from "@/lib/auth/permission.service";

await assertPermission(ctx, { resource: "candidates", action: "update" });
await assertPermission(ctx, { resource: "jobs", action: "read", jobId });
```

- `hasPermission` / `assertPermission` — `src/lib/auth/permission.service.ts`
- List scoping — `src/lib/auth/scope.service.ts` (`jobsWhereClause`, `applicationsWhereClause`, …)
- Tenant write guard — `assertTenantWorkspaceWrite` in `src/lib/auth/platform-admin.ts`
- Session / `AuthContext` — `src/lib/auth/session.ts`

### Read action aliasing

When checking `{ resource, action: "read" }`, the engine also accepts `{resource}.read_all` and `{resource}.read_assigned` if present on the role.

### Cache

Role permissions are cached in memory per process (`loadPermissionCodesForRole`). Restart the app after seed changes, or call `clearPermissionCache()` when an admin UI for permissions exists.

---

## 10. Auth flows

| Flow | Path / command | Result |
|------|----------------|--------|
| Customer signup | `/signup` | New org + `ORG_OWNER` |
| Sign in | `/login` | Session with org role on `AuthContext` |
| Demo login | `/api/auth/demo` | Demo org as owner |
| Invite | `/settings/team` → POST `/api/invites` | Pending invite + link |
| Accept invite | `/invite/[token]` | `OrganizationMember` with invited role |
| Change role | PATCH `/api/members/[memberId]` | Updates `OrganizationMember.roleId` |
| Platform bootstrap | `npm run db:seed` | Roles, permissions, super admin user |
| Env promote | Login as `SUPER_ADMIN_EMAIL` | `isPlatformAdmin` + platform role |

---

## 11. Setup

```bash
npm run db:push
npm run db:seed
```

Required `.env`:

```env
AUTH_SECRET=...
AUTH_URL=https://recruitimate.app
SUPER_ADMIN_EMAIL=...
SUPER_ADMIN_PASSWORD=...
```

**Note:** Changing `SUPER_ADMIN_*` in `.env` does not update the DB until you sign in (auto-sync) or run `npm run db:bootstrap-admin` / `db:seed`.

---

## 12. Testing RBAC

Manual QA checklist: **[TESTER-GUIDE.md](./TESTER-GUIDE.md)** → section **E. Team & RBAC**.

Suggested scenarios:

1. **Recruiter** — sees all jobs/candidates; cannot invite or change roles.
2. **Hiring Manager** — only assigned jobs; can update pipeline on those jobs.
3. **Interviewer** — assigned on one job; can read decision tab for that job’s applications only.
4. **Admin** — invite Recruiter; change their role to Hiring Manager.
5. **Super admin** — `/admin` works; hiring POST without tenant context returns `403`.

---

## 13. What RBAC does **not** support yet

| Capability | Status |
|------------|--------|
| Per-user custom permission checkboxes | **Not built** — assign roles only |
| Per-feature ACL admin UI | **Not built** — edit `prisma/seed.ts` + re-seed |
| OAuth / SSO role mapping | **Not built** |
| Audit log of permission changes | **Not built** |
| Tenant impersonation UI | Planned (P3-011) |

**Integrations page** (`/settings/integrations`) is a catalog only — not part of RBAC.

---

## 14. Related documentation

| Document | Use |
|----------|-----|
| [TESTER-GUIDE.md](./TESTER-GUIDE.md) | Production QA including team/RBAC tests |
| [STRUCTURE.md](./STRUCTURE.md) | Where auth services live in the codebase |
| [PRODUCT-IMPLEMENTATION-STATUS.md](./PRODUCT-IMPLEMENTATION-STATUS.md) | MVP-056 RBAC UI status (Partial) |

---

## 15. Migrating legacy data

If you had pre-auth rows without `organizationId`, attach them to an organization or reset the database before enforcing auth.
