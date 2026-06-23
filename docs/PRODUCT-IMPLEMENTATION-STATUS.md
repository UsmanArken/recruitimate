# Product implementation status

Tracking progress against product team requests (Chunks 1–3). Updated as chunks land.

## Chunk 1 — Talent pool & intake

| Request | Status | Notes |
|---------|--------|-------|
| Generic CV processing (not tied to one role) | **Done** | Talent pool intake; `genericScreening` on candidate |
| Bulk CV upload with role matching | **Done** | Talent pool mode suggests top 3 open roles per CV |
| Dashboard focused on open roles | **Done** | Open roles list is primary on dashboard |
| Bulk upload from Candidates page | **Done** | `CandidatesBulkIntakePanel` |
| Easier upload + auto-fill fields | **Done** | Resume parse extracts name, email, links |
| Show auto-filled fields after upload | **Done** | Green summary on add-candidate form |
| Ranking after processing | **Partial** | Role-fit on assigned jobs; heuristic suggestions in talent pool |
| “Fit for other roles” indicator | **Done** | Role suggestions on candidate profile |
| Multi-org per recruiter | **Done (chunk 2)** | See `HiringClient` below |
| Menu: Open roles before Candidates | **Done** | Sidebar reordered |
| Full candidate profile (upload + intelligence) | **Done** | Profile & source materials section |
| Add organisation then roles | **Done (chunk 2)** | Settings → Client companies |

## Chunk 2 — Roles, profiles, clients

| Request | Status | Notes |
|---------|--------|-------|
| **Talent review** CTA from position pipeline | **Done** | “Talent review” → `?tab=screen` on application |
| Delete profile / markings | **Done** | Archive, on hold, delete on candidate profile |
| Filtering profiles | **Done** | Search, role, stage, profile status; list/card views |
| Schedule interview as calendar | **Done** | Month grid calendar + time picker; `.ics` download unchanged |
| Edit job role | **Done** | `/jobs/[id]/edit` + PATCH API |
| Create role / JD | **Done** | Post role form + **Generate JD from company profile** |
| Job post document (required) | **Done** | Required on create; shown on job detail |
| Client company profile + website | **Done** | Settings → Client companies |
| Consent for company web data | **Done** | Checkbox stored as `webDataConsentAt` |
| Glassdoor / employer brand research | **Not started** | Consent + notes field only; no external fetch |
| JD generation from company profile | **Done** | `POST /api/clients/[id]/job-draft` |
| Interviewer script from company profile | **Not started** | Planned with question bank / live assist |
| Create job ad copy | **Not started** | Later |
| Post job to job boards | **Not started** | Integrations page lists planned providers |
| Recruiter integrations (API keys) | **Planned** | `/settings/integrations` catalog only |
| Delete role | **Done** | Job detail → Delete role |
| List / card view for roles | **Done** | Open roles page toggle + filter by client |
| Filter candidates by role | **Done** | Candidates pipeline filters |
| Same recruiter, multiple client orgs | **Done** | `HiringClient` model; jobs link to client |

## Chunk 3 — Reviews, team, RBAC

| Request | Status | Notes |
|---------|--------|-------|
| Manual recruiter pass/fail on profile screen | **Done** | Screen tab → Recruiter screen review (Pass/Hold/Fail) |
| Recruitimate + recruiter review side by side | **Done** | Labeled sections on Screen and Decision tabs |
| Decision tab not blocked for recruiter verdict | **Done** | Recruiter hire decision always available; AI unlocks after interview |
| Team page shows members table (even if empty) | **Done** | `GET /api/members` + always-visible table |
| Pending invites table (even if empty) | **Done** | Team settings |
| RBAC — assign features per user | **Partial** | Roles + permissions in DB; invite with role + change role on team page. No per-feature custom ACL UI yet. |
| Per-job interviewer assignment | **Done (existing)** | Job detail → assign interviewers (`JOB_INTERVIEWER` role) |

## Not started / later (explicit backlog)

- Automated company web scrape / Glassdoor API
- Job ad generator (LinkedIn/Indeed copy)
- OAuth integrations (LinkedIn, Greenhouse, Lever, Indeed)
- API key storage and sync jobs
- Full LLM role-matching on every bulk CV (currently heuristic for speed)
- Dedicated ranked talent-pool page (all CVs without applications)
- Google/Outlook calendar two-way sync

## Deploy notes

After pulling these changes on any environment:

```bash
npm run db:push
npm run db:seed-demo   # optional — refresh demo data with client company
```

## Key routes

| Area | Path |
|------|------|
| **Tester guide** | `docs/TESTER-GUIDE.md` |
| Client companies | `/settings/clients` |
| Integrations (catalog) | `/settings/integrations` |
| Edit role | `/jobs/[id]/edit` |
| Talent review deep link | `/candidates/.../applications/...?tab=screen` |
