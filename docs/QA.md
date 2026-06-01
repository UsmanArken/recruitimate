# Recruitimate QA

Automated checks for local development and pre-demo validation. Use while finishing MVP; run again before customer demos once production is up.

## Quick commands

| Command | What it runs |
|---------|----------------|
| `npm run qa` | Lint, typecheck, Prisma validate, build, unit tests, DB smoke |
| `npm run qa:static` | Lint + typecheck + Prisma validate + build only |
| `npm run qa:unit` | Intelligence engines + validators + auth helpers |
| `npm run qa:db` | DB connection, roles/permissions seeded, platform admin user |
| `npm run qa:api` | HTTP smoke against running app (see below) |

### API smoke (optional)

Requires the app running (`npm run dev` in another terminal):

```bash
QA_BASE_URL=http://localhost:3000 npm run qa:api
# or include in full suite:
QA_BASE_URL=http://localhost:3000 npm run qa
```

Checks: `/login`, `/signup`, protected routes return 401/redirect, invalid signup returns 4xx.

### Prerequisites

```bash
docker compose up -d
cp .env.example .env
npm run db:push
npm run db:seed
```

## What is automated vs manual

| Automated | Manual (demo checklist) |
|-----------|-------------------------|
| Lint / types / build | Sign in as org owner |
| Talent / interview / decision heuristics | Create job → intake: pick position → upload PDF/DOCX or paste resume |
| Resume extract helpers (normalize, file types) | Open campaign profile; apply same person to second job |
| Zod validators | Add interview transcript on campaign → verify 3 layers + phased states |
| DB roles, permissions, super admin | Invite teammate → accept invite |
| Public/protected HTTP routes | Job team assign interviewer |
| | Platform admin `/admin` (super admin only) |

### Manual demo checklist (MVP-034)

1. **Auth** — Login, logout, signup new org, reserved super-admin email blocked on signup.
2. **Jobs** — Create role, open detail, assign hiring manager / interviewer.
3. **Candidates** — Add with resume, role fit visible, change stage.
4. **Interview** — Paste transcript; interview + decision sections refresh.
5. **Intelligence** — Re-run talent analysis; scores stay in 0–1 range.
6. **ACL** — Recruiter vs hiring manager see expected jobs/candidates.
7. **Super admin** — Login lands on `/admin`; tenant list excludes `recruitimate-platform`; stats are customer-only; hiring workspace blocked until **Browse hiring pipeline**; POST hiring APIs return 403 `TENANT_CONTEXT_REQUIRED`.
8. **Notes** — On candidate person profile add tagged note; appears in list; delete works.
9. **Onboarding** — New workspace shows getting-started checklist; empty states guide post role vs add applicant.
10. **LinkedIn** — Import profile on intake or person page; talent screening refreshes.
11. **Interview workflow** — Schedule → download `.ics` → upload recording → Whisper transcribe → run interview intelligence.
12. **API logs** — API calls emit JSON logs with `requestId` (see server console); responses include `X-Request-Id`.

## CI (when you add production)

Suggested pipeline step:

```yaml
- run: npm ci
- run: npm run db:push
- run: npm run db:seed
- run: npm run qa:static
- run: npm run qa:unit
- run: npm run qa:db
```

Run `qa:api` against a preview deployment URL after deploy.

## Remaining MVP dev (while you set up production)

| ID | Task | Priority | Status |
|----|------|----------|--------|
| MVP-035 | MVP deployment | P1 | Not Started |
| MVP-025 | GitHub / portfolio parsing | P2 | Not Started |
