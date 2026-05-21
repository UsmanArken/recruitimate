# Authentication & ACL (database rule engine)

## Organization roles (4 + job interviewer)

| Code | Name | Scope |
|------|------|--------|
| `ORG_OWNER` | Organization Owner | Full org access |
| `ORG_ADMIN` | Organization Admin | Manage members + all hiring data |
| `RECRUITER` | Recruiter | Org-wide pipeline & intelligence |
| `HIRING_MANAGER` | Hiring Manager | Assigned jobs / managed requisitions |

## Job-level interviewer (database role `JOB_INTERVIEWER`)

Interviewers are not a separate org signup role. Assign users on **Open roles → job detail → Job team** (`/jobs/[id]`). Use `JobAssignment.assignmentRole = INTERVIEWER` or `HIRING_MANAGER`. Permissions are loaded from the **`JOB_INTERVIEWER` role** in the `Role` + `RolePermission` tables (full decision layer included).

## Database tables

- `Permission` — `code` e.g. `candidates.read_all`
- `Role` — org or job scope
- `RolePermission` — many-to-many (**this is the rule engine**)
- `OrganizationMember` — user ↔ org ↔ role
- `JobAssignment` — user ↔ job ↔ INTERVIEWER | HIRING_MANAGER

## Checking permissions

```typescript
await assertPermission(ctx, { resource: "candidates", action: "read", jobId });
```

Effective permissions = org role permissions ∪ job interviewer permissions (from DB).

## Auth flows

| Flow | Path |
|------|------|
| Self signup | `/signup` → creates org + `ORG_OWNER` |
| Sign in | `/login` |
| Invite | `/settings/team` → link `/invite/[token]` |
| Accept invite | Creates member with invited role |

## Setup

```bash
npm run db:push
npm run db:seed   # loads permissions + roles
```

Set `AUTH_SECRET` and `AUTH_URL` in `.env`.

## Migrating existing data

If you had pre-auth candidates/jobs, reset DB or attach rows to an `organizationId` manually before enforcing auth.
