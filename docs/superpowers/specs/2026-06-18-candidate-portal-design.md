# Candidate Portal + Job-Linked Signup + Celery Pipeline

**Date:** 2026-06-18
**Branch:** fastapi-migration
**Status:** Approved — ready for implementation planning

---

## 1. Overview

Add a candidate-facing portal to Recruitimate. Candidates self-signup via a job-specific link, upload their resume, and get their profile automatically scored by the AI pipeline. Recruiters see candidates appear in their pipeline with a source badge and can shortlist or reject them. The portal gives candidates read-only visibility into their application status and scheduled interviews.

This is a purely recruiter-tool feature addition — no LiveKit, no automated AI interviews, no email notifications in this phase.

---

## 2. Out of Scope (Explicitly)

- LiveKit video rooms (Phase 3)
- AssemblyAI real-time transcription (Phase 3)
- Automated AI-conducted interviews (separate planning session)
- Google OAuth for candidates
- Email notifications (interview scheduled, fit score ready)
- Candidate-facing interview report or fit score visibility

---

## 3. Database Changes

### 3.1 Job — 3 new columns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `signupToken` | `String` | `uuid4()` at creation | Unique. Used in `/apply/[token]` URL |
| `interviewMode` | `Enum("live", "automated")` | `"live"` | Set by recruiter at job creation |
| `autoInterviewThreshold` | `Integer` | `60` | 0–100. Only used when `interviewMode = "automated"` |

### 3.2 Candidate — 4 new columns

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `passwordHash` | `String \| None` | `None` | Null for recruiter-created, set for portal self-signup |
| `jobId` | `String \| None` FK → Job | `None` | Locked to job at signup. Null for recruiter-created |
| `status` | `Enum("applied", "shortlisted", "rejected")` | `"applied"` | Managed by recruiter |
| `portalCreatedAt` | `DateTime \| None` | `None` | Timestamp of self-signup. Null for recruiter-created |

### 3.3 Partial unique index

```sql
CREATE UNIQUE INDEX candidate_portal_email_unique
ON "Candidate" (email)
WHERE "passwordHash" IS NOT NULL;
```

Enforces email uniqueness only for portal candidates. Recruiter-created records are unaffected.

### 3.4 No new tables

`JobApplication` is auto-created at self-signup, linking `Candidate → Job`. Existing table structure unchanged.

---

## 4. Backend

### 4.1 New public endpoints (no auth)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/apply/{token}` | Returns job `title`, `description`, org `name`. Candidate sees this before filling the form. |
| `POST` | `/api/apply/{token}/signup` | Creates `Candidate` + `JobApplication`, hashes password, enqueues `score_candidate` Celery task. Returns `candidate_token` HTTP-only cookie. |
| `POST` | `/api/candidate/auth/login` | Email + password → sets `candidate_token` cookie |
| `POST` | `/api/candidate/auth/logout` | Clears `candidate_token` cookie |

### 4.2 New authenticated candidate endpoints

All require `candidate_token` cookie. Handled by new `CurrentCandidate` FastAPI dependency.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/candidate/me` | Own profile: name, email, URLs, `TalentProfile.skills`, `TalentProfile.experienceYears` only (no fit score, no strengths, no gaps, no explanation), application status, scheduled interviews. |
| `PATCH` | `/api/candidate/me` | Update name, email, `githubUrl`, `linkedInUrl` |
| `POST` | `/api/candidate/me/resume` | Re-upload resume → enqueues new `score_candidate` task, overwrites previous `TalentProfile` |
| `GET` | `/api/candidate/me/interviews` | Scheduled interviews: title, date/time, meetingUrl, status |

### 4.3 Modified recruiter endpoints

| Method | Path | Change |
|--------|------|--------|
| `POST` | `/api/jobs` | Accepts `interviewMode`, `autoInterviewThreshold`. Auto-generates `signupToken`. |
| `GET` | `/api/jobs/{id}` | Returns `signupToken` so recruiter can copy/share the link |
| `GET` | `/api/candidates` | Returns `source: "portal" \| "manual"` per candidate (derived: `passwordHash IS NOT NULL`) |
| `PATCH` | `/api/candidates/{id}/status` | **New.** Moves candidate to `shortlisted` or `rejected`. Updates `JobApplication.stage`. |

### 4.4 Candidate JWT shape

```json
{
  "sub": "<candidateId>",
  "jobId": "<jobId>",
  "type": "candidate",
  "exp": "<30 days>"
}
```

`type: "candidate"` distinguishes from recruiter tokens. Same `AUTH_SECRET`. Cookie name: `candidate_token`. HTTP-only, SameSite=Lax.

### 4.5 New FastAPI dependency — `CurrentCandidate`

Reads `candidate_token` cookie, decodes JWT, asserts `type == "candidate"`, returns candidate auth context. All `/api/candidate/*` endpoints use this instead of `CurrentUser`.

---

## 5. Celery + Redis

### 5.1 New packages

```toml
celery = {extras = ["redis"], version = "^5.3"}
redis = "^5.0"
```

### 5.2 New env vars

```
REDIS_URL=redis://localhost:6379/0
```

### 5.3 New files

```
backend/app/workers/
├── __init__.py
├── celery_app.py     — Celery app init
└── tasks.py          — score_candidate task
```

### 5.4 `score_candidate(candidate_id)` task — step by step

1. Open sync SQLAlchemy session
2. Load `Candidate` + `Job` from DB
3. Run `run_talent_intelligence(resume_text, job_requirements)` via `asyncio.run()`
4. Upsert `TalentProfile` (create or overwrite if re-upload)
5. Update `JobApplication.stage = TALENT_REVIEW`
6. If `job.interviewMode == "automated"` AND `roleFitScore >= job.autoInterviewThreshold`:
   - Create `Interview` record (`status=SCHEDULED`, `title="AI Interview"`)
   - Update `JobApplication.stage = INTERVIEW_SCHEDULED`
7. Close session

### 5.5 Local dev setup

```bash
# Terminal 1
uvicorn app.main:app --reload

# Terminal 2
celery -A app.workers.celery_app worker --loglevel=info

# Terminal 3 (Docker)
docker run -p 6379:6379 redis:7-alpine
```

---

## 6. Frontend

### 6.1 New route group `(candidate)/`

```
src/app/
├── (candidate)/
│   ├── layout.tsx                                  — minimal nav: logo, "My Application", logout
│   ├── apply/[token]/page.tsx                      — public signup page
│   ├── candidate/login/page.tsx                    — candidate login
│   └── candidate/dashboard/
│       ├── page.tsx                                — server component, fetches /api/candidate/me
│       └── profile-edit-form.tsx                  — client component, editable fields + resume upload
```

### 6.2 `/apply/[token]` — signup page

- Server component fetches `GET /api/apply/{token}` → renders job title + description
- 404 if token not found
- Client form fields: full name (required), email (required), password (required), resume file (required), LinkedIn URL (optional), GitHub URL (optional)
- On submit → `POST /api/apply/{token}/signup`
- On success → redirect to `/candidate/dashboard` + show "Analysing your profile…" banner
- Banner polls `GET /api/candidate/me` every 3s until `talentProfile` is non-null or 60s timeout
- On timeout → show "Analysis is taking longer than expected — check back soon"

### 6.3 `/candidate/dashboard` — portal home

Three sections:

**Application status:**
- Job title + company name
- Stage badge: `Applied → Talent Review → Shortlisted → Interview Scheduled → Interviewed → Decision`
- Derived from `JobApplication.stage`

**Your profile (editable):**
- Name, email, LinkedIn URL, GitHub URL — inline edit, saves to `PATCH /api/candidate/me`
- Resume section: filename of current resume + "Re-upload resume" button
- Re-upload triggers `POST /api/candidate/me/resume` → shows "Re-analysing…" polling state same as signup

**Interviews:**
- Read-only list: title, scheduled date/time, meeting link (if set), status badge
- Empty state: "No interviews scheduled yet — we'll notify you when one is booked."

### 6.4 Recruiter-side changes

**Candidate card:**
- `Portal` badge shown when `source == "portal"`
- `Shortlist` and `Reject` buttons call `PATCH /api/candidates/{id}/status`

**Job creation form — 3 new fields:**
- `Interview Mode` — radio: `Live` / `Automated`
- `Auto-interview threshold` — number input 0–100, only shown when `Automated` selected
- After job is created — "Candidate signup link" field with copy button showing `/apply/[signupToken]`

### 6.5 Middleware changes

```
/candidate/*        → check candidate_token cookie → redirect /candidate/login if missing/expired
/apply/*            → public, no auth check
/(recruiter)/* (all existing routes) → check token cookie → redirect /login (unchanged)
```

---

## 7. Data Flow — Full Candidate Journey

```
Recruiter creates job (interviewMode=automated, threshold=65)
  → signupToken generated, recruiter copies /apply/[token] link

Candidate opens /apply/[token]
  → sees job title + description
  → fills form, uploads resume
  → POST /api/apply/{token}/signup
    → Candidate row created (passwordHash set, jobId set)
    → JobApplication row created (stage=NEW)
    → candidate_token JWT cookie set
    → score_candidate.delay(candidate_id) enqueued
  → redirected to /candidate/dashboard
  → polling begins

Celery worker picks up score_candidate
  → runs run_talent_intelligence()
  → TalentProfile saved (roleFitScore=72)
  → JobApplication.stage = TALENT_REVIEW
  → 72 >= 65 → Interview created (status=SCHEDULED)
  → JobApplication.stage = INTERVIEW_SCHEDULED

Candidate dashboard polling resolves
  → "Analysing…" banner clears
  → Profile shows parsed skills, experience
  → Stage badge shows "Interview Scheduled"

Recruiter dashboard
  → Candidate appears with "Portal" badge
  → Stage shows INTERVIEW_SCHEDULED
  → Recruiter can still shortlist/reject manually
```

---

## 8. Security Notes

- Fit score, strengths, gaps, and decision data are never returned by `/api/candidate/*` endpoints
- `candidate_token` JWT has `type: "candidate"` — recruiter endpoints reject it at the dependency level
- `signupToken` is a UUID — not guessable, not sequential
- Partial unique index prevents duplicate portal signups for same email per job
- Password hashed with bcrypt (same `passlib` setup as recruiter passwords)
