# Recruitimate — Tester Guide

**Purpose:** Single handout for manual QA on production.  
**Environment:** https://recruitimate.app  
**Last updated:** Product feedback chunks 1–3 (post-MVP polish)

---

## 1. Access

### Demo workspace (recommended)

1. Open https://recruitimate.app/login  
2. Click **Go to Demo**  
3. Confirm the blue **Demo workspace** banner at the top

| Field | Value |
|-------|--------|
| Email | `demo@recruitimate.app` |
| Password | `DemoRecruit2026!` |

**Pre-loaded demo data**

| Open role | Sample candidates |
|-----------|-------------------|
| Senior Backend Engineer | Sarah Chen (full interview + decision), Marcus Johnson, Alex Rivera |
| Product Manager — Fleet Software | Priya Patel, Jamie Wong |
| Client company | Acme Robotics |

If **Go to Demo** returns an error, the demo org is not seeded — ask engineering to run `npm run db:seed-demo` on the server.

### Super admin (platform tests only)

Use only when testing `/admin` and cross-tenant behaviour — **not** for day-to-day hiring flows.

| Field | Value |
|-------|--------|
| Email | `superadmin@recruitimate.io` |
| Password | `12345678` |

Expected: lands on **Platform admin**; hiring writes blocked until **Browse hiring pipeline**.

### Your own workspace

Use **Create a workspace** on the login page to sign up a fresh org for invite/RBAC tests.

---

## 2. Navigation map

| Area | Path | Sidebar |
|------|------|---------|
| Dashboard | `/` | Workspace → Dashboard |
| Open roles | `/jobs` | Workspace → Open roles |
| Post role | `/jobs/new` | Button on Open roles |
| Candidates | `/candidates` | Workspace → Candidates |
| Add candidate | `/candidates/new` | Add candidate (footer) |
| Client companies | `/settings/clients` | **Settings** → Client companies |
| Team & access | `/settings/team` | **Settings** → Team & access |
| Integrations (catalog) | `/settings/integrations` | **Settings** → Integrations |

**Application profile** (per person + role):  
`/candidates/{candidateId}/applications/{applicationId}`  
Tabs: **Screen** · **Interview** · **Decision**

---

## 3. Quick smoke test (~10 minutes)

Use the demo account.

1. **Login** — Go to Demo → dashboard loads; demo banner visible.  
2. **Open roles** — Click sidebar link; loading bar/skeleton appears; list loads. Click **Senior Backend Engineer** → pipeline opens.  
3. **Talent review** — From pipeline, click **Talent review** on Sarah Chen → **Screen** tab opens.  
4. **Dual review** — On Screen: **Recruitimate review** (AI) + **Recruiter screen review** (Pass/Hold/Fail). Set **Pass** + optional notes.  
5. **Interview** — Tab shows analyzed interview for Sarah.  
6. **Decision** — **Recruiter hire decision** always visible; **Recruitimate** hire confidence visible for Sarah (interview complete).  
7. **Candidates** — Filters: role, stage, profile status. Switch list/card.  
8. **On hold** — Open a candidate you added → **Mark on hold** → Candidates → Profile status **On hold** → candidate appears.  
9. **Settings** — **Team & access**: members table (solo empty state OK). **Client companies**: Acme Robotics.  
10. **Post role** — Open roles → Post new role → select Acme → title + description (20+ chars) → submit → appears in list.

---

## 4. Full test checklist

Mark each: **Pass** · **Fail** · **N/A** · **Blocked**

### A. Auth & session

| # | Test | Steps | Expected |
|---|------|--------|----------|
| A1 | Demo login | Go to Demo | Dashboard; demo banner |
| A2 | Manual login | demo@recruitimate.app + password | Same workspace |
| A3 | Logout | User menu → Sign out | Login page |
| A4 | Signup | New org via /signup | New workspace; getting-started card |
| A5 | Protected routes | Visit `/candidates` logged out | Redirect to login |

### B. Open roles & clients

| # | Test | Steps | Expected |
|---|------|--------|----------|
| B1 | List roles | Open roles | Cards/list toggle; client filter if multiple clients |
| B2 | Open role detail | Click a role | Pipeline table; bulk upload zone |
| B3 | Talent review CTA | Pipeline → Talent review | Application Screen tab (`?tab=screen`) |
| B4 | Create role | Post new role; job post ≥20 chars | 201; role in list |
| B4b | **Role Spark** | Title + keywords → Spark my job description | All three JD fields filled; no client required |
| B5 | Generate JD (client) | Select client → Generate JD from company profile | Description/requirements/post filled |
| B6 | Edit role | Job detail → Edit → save | Changes persist |
| B7 | Delete role | Delete a test role you created | Removed from list |
| B8 | Client company | Settings → Client companies → add/edit | Saved; usable on new role |
| B9 | Navigation feedback | Click Open roles / a role | Top progress bar + page loader |

### C. Candidates & talent pool

| # | Test | Steps | Expected |
|---|------|--------|----------|
| C1 | Add candidate | Upload PDF or paste resume | Name/email/links auto-filled where possible |
| C2 | Role-specific intake | Add candidate linked to open role | Application created; talent scores appear |
| C3 | Talent pool | Add without role / bulk talent pool mode | Candidate in pool; role suggestions if applicable |
| C4 | Bulk upload | Candidates page bulk panel | Files processed; matches or pool entries |
| C5 | Person profile | Open candidate | Source materials; role suggestions for other roles |
| C6 | Filters | Search, role, stage, profile status | Results match filters |
| C7 | On hold | Mark on hold → filter On hold | Candidate visible under On hold |
| C8 | Archive | Archive → filter Archived | Candidate visible |
| C9 | Restore | Restore active from on hold/archive | Back under Active filter |
| C10 | Delete | Delete test candidate | Removed from pipeline |

### D. Application tabs (Screen / Interview / Decision)

| # | Test | Steps | Expected |
|---|------|--------|----------|
| D1 | Recruitimate screen | Screen tab | Role fit, skills, strengths/gaps, explanation |
| D2 | Recruiter screen | Pass / Hold / Fail + notes | Verdict saved; stage may update |
| D3 | Re-run screening | Re-run screening button | Talent profile refreshes |
| D4 | Interview tab | Sarah Chen or paste transcript | Scores and signals after analysis |
| D5 | Schedule interview | Calendar grid + time → save | Scheduled; `.ics` download if offered |
| D6 | Recruiter hire decision | Decision tab before interview done | Pass/Fail available without AI block |
| D7 | Recruitimate decision | Sarah (interview analyzed) | Hire confidence + advisory summary |
| D8 | Live assist | Interview tab during scheduled interview | Live assist panel (beta) loads |

### E. Team & RBAC

| # | Test | Steps | Expected |
|---|------|--------|----------|
| E1 | Members table | Settings → Team & access | Table always shown (empty state if solo) |
| E2 | Pending invites | Create invite | Appears in pending table; link generated |
| E3 | Role descriptions | RBAC section on team page | Roles + permission codes listed |
| E4 | Change role | Change member role (non-owner) | Role updates if you have permission |
| E5 | Job interviewer | Job detail → assign interviewer | Interviewer on job team |

### F. Platform admin (super admin only)

| # | Test | Steps | Expected |
|---|------|--------|----------|
| F1 | Admin home | Login as super admin | `/admin` |
| F2 | Tenant list | View organizations | Customer orgs; not `recruitimate-platform` |
| F3 | Browse pipeline | Browse hiring data | Read-only candidate view |
| F4 | Write blocked | Try POST hiring API or edit in browse mode | 403 `TENANT_CONTEXT_REQUIRED` |

### G. Notes & onboarding

| # | Test | Steps | Expected |
|---|------|--------|----------|
| G1 | Notes | Candidate profile → add note | Appears in list; delete works |
| G2 | Onboarding | Fresh signup workspace | Getting-started checklist on dashboard |

---

## 5. Out of scope (do not file as bugs)

These are **planned or partial** — see `PRODUCT-IMPLEMENTATION-STATUS.md`.

| Feature | Status |
|---------|--------|
| Post jobs to LinkedIn / Indeed | Not started (integrations catalog only) |
| ATS sync (Greenhouse, Lever) | Not started |
| Glassdoor / employer brand scrape | Not started |
| Job ad copy generator | Not started |
| OAuth calendar two-way sync | Not started (`.ics` + in-app scheduler only) |
| Custom per-user feature toggles | Partial (role-based RBAC only) |
| Full LLM scoring on every bulk CV | Partial (heuristics for bulk speed) |
| Dedicated talent-pool ranking page | Not started |
| GitHub / portfolio deep parsing | Not started (URL fields only) |

**Integrations page** lists providers as **Planned** — no API keys or sync yet.

---

## 6. Reporting bugs

Include:

1. **URL** and **account** (demo / your test org / super admin)  
2. **Steps to reproduce**  
3. **Expected vs actual**  
4. **Screenshot or console error** (e.g. network tab status code)  
5. **Browser** (Chrome/Firefox/Safari + version)

For API errors, note the response body `error` and `code` fields.

---

## 7. Related docs

| Doc | Audience |
|-----|----------|
| [QA.md](./QA.md) | Developers — automated `npm run qa` scripts |
| [PRODUCT-IMPLEMENTATION-STATUS.md](./PRODUCT-IMPLEMENTATION-STATUS.md) | Product/engineering — feature scope |
| [AUTH-ACL.md](./AUTH-ACL.md) | **Full RBAC reference** — permission matrix, scoping, team rules |
| [recruitimate-product-guide.html](./recruitimate-product-guide.html) | Product architecture background (optional) |

---

## 8. Reset demo data

If the demo workspace is messy after testing, ask engineering:

```bash
ssh recruitimate@<server>
cd ~/recruitimate && npm run db:seed-demo
```

Then log in again with **Go to Demo**.
