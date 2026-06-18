# Candidate Multi-Job Design

**Date:** 2026-06-18  
**Status:** Approved

## Problem

The codebase was built with an implicit one-candidate-per-job assumption. Specifically:

- `Candidate.jobId` — a FK tying each candidate to a single job
- `Candidate.status` — one global pipeline status, not per-application
- `CandidateAuthContext.job_id` — auth token embedded a single job ID
- `candidate_portal/service.py` — signup set `candidate.jobId = job.id`
- `get_candidate_me` — returned only the most recent application
- `update_candidate_status` — updated global status and guessed the most recent application's stage
- `score_candidate` Celery task — used `candidate.jobId` to load job requirements

The correct model: one `Candidate` can have many `JobApplication` rows across many jobs. The `JobApplication` already owns the job relationship correctly — the Candidate-level fields were redundant and wrong.

---

## Design

### Two Candidate Tracks

**Portal track** — candidate self-serves via `/apply/[token]`. They create their own account and set their own password. `passwordHash` is set on the Candidate row.

**Recruiter track** — recruiter manually adds a candidate. A Candidate row is created with no password (`passwordHash = null`). The candidate may never log in. No temp password, no portal account created automatically.

A candidate moves from recruiter track to portal track naturally: if they later self-apply via a job link with the same email, the existing record gains a `passwordHash` and `portalCreatedAt`.

---

### Section 1: Data Model Changes

**Remove from `Candidate`:**
- `jobId` column + FK constraint + `applied_job` relationship
- `status` column

**Keep on `Candidate`:**
- `passwordHash` (null = recruiter-only, set = has portal account)
- `portalCreatedAt` (set when they first claim their account via portal)

**Add to `Candidate`:**
- Partial unique index: `UNIQUE (organizationId, email) WHERE email IS NOT NULL`
  - Per-org uniqueness — same person can apply to multiple companies
  - Null emails are unaffected (legacy recruiter-added candidates without email)

**`JobApplication.stage`** is already the source of truth for pipeline status per job. No changes needed to `JobApplication`.

---

### Section 2: Recruiter Track — Candidate Creation

- `email` is now **required** on `CreateCandidateRequest` (was optional)
- Before creating: check if `(organizationId, email)` already exists
  - **Exists** → reuse the record, create a new `JobApplication` for the selected job (if not already applied). Return the existing candidate + new application. No duplicate rows.
  - **Does not exist** → create new `Candidate` (no `passwordHash`), create `JobApplication` if `jobId` provided
- No password, no portal account, no temp credentials generated

---

### Section 3: Portal Track — Candidate Signup

At `POST /api/apply/{token}/signup`:

1. Look up job by `signupToken`
2. Check for existing `Candidate` with `(organizationId, email)`:

   | State | Action |
   |-------|--------|
   | Exists, `passwordHash = null` (recruiter-added) | Set `passwordHash`, set `portalCreatedAt`. Add `JobApplication` for this job if not already applied. Return token. |
   | Exists, `passwordHash` set (already has portal account) | Return 409: "An account with this email already exists — please log in." |
   | Does not exist | Create `Candidate` with `passwordHash` + `portalCreatedAt`. Create `JobApplication`. Return token. |

3. On all success paths: `score_application.delay(app.id)` enqueued for the new application.

The candidate who self-applies after being recruiter-added sees **all their applications** in the dashboard — both recruiter-added and self-applied.

---

### Section 4: Auth Token & Candidate Dashboard

**Token payload** (simplified — no more `jobId`):
```json
{ "sub": "<candidate_id>", "type": "candidate" }
```

**`CandidateAuthContext`** drops `job_id` field.  
**`CandidateUser`** in frontend localStorage drops `jobId`.

**`GET /api/candidate/me`** returns all applications:
```json
{
  "id": "...",
  "name": "...",
  "email": "...",
  "skills": [...],
  "experienceYears": 4,
  "applications": [
    {
      "id": "...",
      "jobTitle": "Senior Engineer",
      "stage": "TALENT_REVIEW",
      "roleFitScore": 72,
      "interviews": []
    },
    {
      "id": "...",
      "jobTitle": "Product Analyst",
      "stage": "NEW",
      "roleFitScore": null,
      "interviews": []
    }
  ]
}
```

**Candidate dashboard** renders a list of application cards instead of a single status badge.

---

### Section 5: Status Updates (Recruiter Side)

- Endpoint changes: `PATCH /api/candidates/{id}/status` → `PATCH /api/applications/{id}/status`
- Body: `{ "stage": "SHORTLISTED" | "REJECTED" }`
- Sets `JobApplication.stage` directly on the target application
- `Candidate.status` removed — no global status concept
- Recruiter UI shortlist/reject buttons pass `applicationId` not `candidateId`

---

### Section 6: Migrations

**Migration 1 — Candidate table cleanup:**
```sql
ALTER TABLE "Candidate" DROP COLUMN "jobId";
ALTER TABLE "Candidate" DROP COLUMN "status";
CREATE UNIQUE INDEX candidate_email_org_unique 
  ON "Candidate" ("organizationId", email) 
  WHERE email IS NOT NULL;
```
Existing data: `status` values discarded (JobApplication.stage is the source of truth). `jobId` values discarded (JobApplication rows already have correct jobId).

**Migration 2:** No schema change — the applications status endpoint is a routing/service change only.

---

## Files to Change

### Backend
| File | Change |
|------|--------|
| `backend/app/shared/models.py` | Remove `jobId`, `status`, `applied_job` from Candidate; add unique index note |
| `backend/alembic/versions/new_migration.py` | Drop columns, add partial unique index |
| `backend/app/features/candidates/schemas.py` | Make `email` required on `CreateCandidateRequest` |
| `backend/app/features/candidates/service.py` | `create_candidate` — dedup by email, reuse record. Remove `update_candidate_status`. |
| `backend/app/features/candidates/router.py` | Remove `PATCH /{id}/status` endpoint |
| `backend/app/features/applications/router.py` | Add `PATCH /{id}/status` endpoint |
| `backend/app/features/applications/service.py` | Add `update_application_stage(app_id, org_id, stage, db)` |
| `backend/app/features/candidate_portal/service.py` | Signup: detect existing record, merge. Drop `candidate.jobId`. `get_candidate_me`: return all applications. |
| `backend/app/features/candidate_portal/schemas.py` | `_make_candidate_token`: remove `jobId` from payload |
| `backend/app/core/dependencies.py` | `CandidateAuthContext`: remove `job_id` |
| `backend/app/workers/tasks.py` | Remove `score_candidate` task (or fix it); `score_application` is the correct path |

### Frontend
| File | Change |
|------|--------|
| `frontend/src/lib/candidate-auth-client.ts` | Remove `jobId` from `CandidateUser` interface |
| `frontend/src/app/(candidate)/candidate/dashboard/page.tsx` | Render list of applications instead of single status |
| `frontend/src/components/features/candidates/` | Shortlist/reject buttons pass `applicationId` |

---

## What Is NOT Changing

- `JobApplication` model — already correct
- `score_application` Celery task — already ties resume to specific job requirements correctly
- `delete_job` orphan logic — already handles multi-job candidates correctly
- Bulk import dedup — already correct (same email = same person, checks for duplicate application to same job)
- The unique constraint on `JobApplication (candidateId, jobId)` — stays, prevents duplicate applications to the same role
