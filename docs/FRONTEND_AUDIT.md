# Frontend Audit — Complete Analysis
**Date:** 2026-06-30

Every page and component audited. Findings categorised as: ✅ Working, ⚠️ Partial/Gap, ❌ Missing/Broken, 🟣 Placeholder/Dummy, 🔵 UX Issue.

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Fully wired | 12 |
| ⚠️ Partial / gap | 9 |
| ❌ Missing backend or UI | 6 |
| 🟣 Placeholder / dummy | 8 |
| 🔵 UX issue | 7 |

---

## Auth & Onboarding

### `/login` — Recruiter Login

- ✅ Full login flow wired to `/api/auth/login`. Stores token + user in localStorage, sets cookie, redirects platform admins to `/admin`.
- ✅ Callback URL respected on redirect — deep links work after session expiry.
- ⚠️ **No "Forgot password" flow.** No link, no reset endpoint, no page. If a user forgets their password they are locked out permanently.
- 🔵 Error message is generic ("Invalid credentials"). No distinction between wrong password vs. email not found.

---

### `/signup` — Workspace Registration

- ✅ Calls `/api/auth/signup`, stores token, fetches `/api/auth/me`, redirects to dashboard.
- ⚠️ **No email verification.** Account is active instantly — no confirmation email, no verified state in the UI.
- 🟣 The "Hiring intelligence" highlights on the auth layout left panel are hardcoded marketing copy.

---

### `/invite/[token]` — Team Invite Acceptance

- ✅ Fetches invite metadata from `/api/invites/{token}`. Error states for expired/used tokens are handled.
- ⚠️ **Invite email is not sent by the backend.** The invite link must be manually copied and pasted. No email delivery mechanism exists.

---

## Recruiter Workspace — Core Pages

### `/` — Dashboard

- ✅ Four stat cards (roles, candidates, position reviews, interviews) are real counts from live API calls.
- ✅ Jobs list and pipeline activity table are live, RBAC-scoped (HM sees only assigned jobs).
- ✅ AI recommendation badges and recruiter verdict badges correctly map enum values to colour-coded labels.
- ⚠️ `GettingStartedCard` checks `hasInterview` as `stats.interviewed` (count of applications past INTERVIEWED stage) — a scheduled-but-not-yet-completed interview won't tick the checklist.
- 🟣 The three `LayerBadge` pills (Talent / Interview / Decision) below the header are decorative — they don't link anywhere.
- 🔵 Dashboard shows "recent 10 applications" with no filter, sort, or "View all" link to the full pipeline.

---

### `/jobs` — Open Roles List

- ✅ Jobs fetched from `/api/jobs`, HM scope enforced at backend and frontend (button hidden).
- ⚠️ **Empty state passes `primaryAction` unconditionally** — a Hiring Manager sees a "Post your first role" link that leads to a 403.
- 🔵 No search or filter on the jobs list.

---

### `/jobs/new` — Post New Role

- ✅ Client selector, title, description, requirements, public job post, interview mode all wired to `POST /api/jobs`.
- ✅ AI JD generation calls `POST /api/clients/{id}/job-draft` and populates description / requirements / jobPostDocument.
- ✅ Post-creation candidate signup link generated and copyable.
- ⚠️ **Automated interview threshold UI exists** but it is unclear whether the backend actually auto-schedules interviews when a candidate's score crosses the threshold. The field is stored but the trigger logic was not confirmed implemented.
- 🔵 After creating a job, the only CTA is "Go to jobs list" — no "Go to job detail" button.
- 🔵 JD generation requires a client but there is no inline "create a client" shortcut if no clients exist.

---

### `/jobs/[id]` — Job Detail

- ✅ Bulk resume upload wired to `POST /api/jobs/{id}/bulk-resumes`. Progress bar, per-file results (created / duplicate / failed), jump-to-pipeline link all work.
- ✅ Job assignments panel (hiring manager + interviewers) wired to `/api/jobs/{id}/assignments`.
- ✅ Signup link card shows candidate-facing apply URL with copy button.
- 🟣 **Interview Question Bank** is labelled `Phase 2`. The UI is fully built but the backend endpoint `POST /api/jobs/{id}/interview-questions` needs to be confirmed implemented. Every "Generate" click may return an error.
- ❌ **No job edit form.** `PUT /api/jobs/{id}` exists on the backend but there is no UI path to call it. Job title, description, and requirements cannot be updated after creation.
- 🔵 Pipeline table has no pagination — unwieldy with bulk uploads.

---

### `/candidates` — Candidates Pipeline

- ✅ Fetches from `/api/candidates`, HM scoping enforced backend-side.
- ✅ `CandidatesPipelineView` renders per-job grouping with stage filtering.
- 🔵 No global search across candidate names or emails.

---

### `/candidates/new` — Add Candidate

- ✅ Resume upload (`/api/resume/parse`), LinkedIn import, validation, submits to `POST /api/candidates`.
- ✅ Resume + LinkedIn combined 20-char minimum enforced client-side.
- 🟣 **LinkedIn "import" is manual paste.** The field label implies automation; the reality is copy-paste from the LinkedIn webpage.
- ⚠️ If `/api/resume/parse` fails, the form has no clear escape path to proceed with manual text entry.

---

### `/candidates/[id]` — Candidate Profile

- ✅ Notes panel wired — create, tag, delete notes via `/api/candidates/{id}/notes`.
- ✅ Star/flag marking buttons call `PATCH /api/candidates/{id}`.
- ✅ "Apply to another position" dropdown wired and submits new application.
- ⚠️ **LinkedIn enrichment panel** claims to "refresh talent scores across all campaigns" but shows no confirmation of how many applications were re-analysed or whether they succeeded.
- ❌ **No edit form for candidate name or email.** Typos cannot be corrected after creation.
- 🔵 Source profile shows full resume text in a read-only box with no way to update it.

---

### `/candidates/[id]/applications/[applicationId]` — Application Detail (Intelligence Hub)

#### Talent Tab

- ✅ Role fit score, experience years, matched/missing/extra skills, strengths, gaps, hidden signals, AI explanation all rendered from real backend data.
- ✅ Reanalyze button polls `/api/applications/{id}` every 3 s up to 90 s. TalentPoller handles initial pending state with 4 s polling for 120 s.
- ✅ Talent recruiter review panel (PASS/HOLD/FAIL) wired to `PATCH /api/applications/{id}/recruiter-review` with `kind: "talent"`.

#### Interview Tab

- ✅ Interview scheduling, LiveKit room join, candidate link copy, .ics download all wired.
- ✅ After interview: confidence, clarity, pacing, filler, emotional variance, truthfulness, depth, work-style, resume consistency, risk flags, inconsistencies all rendered.
- ✅ Signal radar chart correctly maps 5 audio scores. Invert logic for filler words is correct.
- ✅ Transcript drawer shows full interview transcript.
- 🟣 **"Audio analysis will be available in Phase 2"** — hardcoded message shown when `agentStatus === "finished"`. All audio scores (confidence, clarity, pacing, filler, energy, tone, emotional variance) will be `null` for interviews in this state. No audio processing runs yet.
- 🟣 **`energyLevel` field** is defined in `InterviewAnalysisData` type but is never rendered anywhere in `InterviewAnalysisTabs` — collected by backend, silently dropped in UI.
- ⚠️ **No polling for interview analysis completion.** After AI finishes analysing an interview the page does not auto-refresh. Users must manually reload — unlike the talent tab which has an explicit poller.

#### Decision Tab

- ✅ AI recommendation banner (HIRE/LEAN_HIRE/HOLD/LEAN_REJECT/REJECT) with icon, explanation, and for/against reasons fully rendered.
- ✅ Shortlist / Reject stage buttons call `PATCH /api/applications/{id}/status` with optimistic UI.
- ✅ Hire review panel (PASS/HOLD/FAIL) wired with `kind: "hire"`. Shows last reviewer name + timestamp.
- 🟣 **Interviewer quality panel** (`InterviewerQualityPanel`) — the `interviewerQuality` field is typed as `unknown` in `InterviewAnalysisData`. Schema not finalised; structure of this object is not typed.
- ⚠️ Phase banner "Committee recommendation" tile shows only the *hire review* verdict. The *talent review* verdict is never surfaced in the banner — two separate review panels exist but only one feeds the summary.

---

## Live Interview

### `/interview/join` — Live Interview Room

- ✅ LiveKit room join via token from `/api/applications/{id}/interviews/{id}/token`.
- ✅ Live transcript polls `/transcript-live` every 3 s. Auto-scrolls. Speaker-differentiated bubbles.
- ✅ "Suggest follow-up" posts to `/suggest` and renders question list.
- ⚠️ No error state if LiveKit token is invalid or expired — likely silent crash.
- ⚠️ Transcript poll errors are swallowed (`catch {}`). If backend returns 500, panel shows "Waiting for speech…" indefinitely.
- 🔵 No visible "Return to application" back-navigation button.

---

## Candidate Self-Service Portal

### `/apply/[token]` — Application Form

- ✅ Email check — returning candidates with a resume skip the resume step.
- ✅ Calls `/api/apply/{token}/signup`, stores candidate auth, redirects with `?analysing=1`.
- ⚠️ No password strength indicator — only an 8-char minimum enforced.
- ⚠️ Invalid/expired apply token may show a blank or crashed page rather than a clear error message.

---

### `/candidate/login` — Candidate Login

- ✅ Calls `/api/candidate/auth/login`, stores token, respects callback URL.
- ⚠️ **No password reset flow.** Same permanent-lockout gap as recruiter login.

---

### `/candidate/dashboard` — Candidate Dashboard

- ✅ Applications list with stage labels and "Join Interview" links for scheduled interviews.
- ✅ Profile edit form (name, email, LinkedIn, GitHub) wired to the candidate API.
- 🟣 **Stage labels are hardcoded raw Tailwind colours** (`bg-blue-100 text-blue-700`, etc.) instead of using the shared `StageBadge` component. Duplicated, out-of-sync mapping.
- 🟣 **Re-upload resume** shows a 60-second "Re-analysing…" banner that clears on a timer with no real polling. The candidate gets no confirmation the analysis actually completed.
- ⚠️ No feedback to the candidate beyond a stage label — no fit score, no notes, no "what happens next".
- 🔵 Header says "Recruitimate" with no org name. A candidate applying to multiple orgs through the platform has no context about which one they're on.

---

## Settings

### `/settings/team` — Team & Access

- ✅ Invite form (email + role) calls `POST /api/invites`. Pending invite list with expiry and revoke.
- ✅ Role dropdown calls `PATCH /api/invites/members/{id}`. Remove button calls `DELETE` with confirmation.
- ✅ Self-modification guard prevents admins changing their own role or removing themselves.
- ⚠️ **Invite email is not sent.** Admins must share the link manually.
- ⚠️ **No invite link copy button** on pending invite rows. The token exists in the backend but the frontend only shows email + expiry + revoke — the admin cannot re-share the link.

---

### `/settings/clients` — Client Companies

- ✅ CRUD wired. Add form with company profile and impression notes. Delete disabled if jobs assigned.
- ✅ RBAC correct — HMs can't see this page; form and delete button hidden for non-admin roles.
- ❌ **No edit form for an existing client.** To update the company profile or impression notes you must delete and recreate — losing the job association.

---

### `/admin` — Platform Admin Panel

- ✅ Org stats from `/api/admin/organizations`. Tenant table rendered.
- 🟣 **Tenant impersonation** — banner says "coming soon". Operators cannot switch into an org's context.
- ⚠️ No actions from the admin panel — no suspend, no password reset, no billing management. Pure read-only.

---

## Cross-Cutting Issues

### Missing — No UI and/or no backend confirmed

| # | Issue |
|---|-------|
| 1 | **Job edit form** — `PUT /api/jobs/{id}` exists but nothing in the frontend calls it. Jobs cannot be updated after creation. |
| 2 | **Client edit form** — `PATCH /api/clients/{id}` exists but is unreachable from the UI. |
| 3 | **Candidate name/email edit** — no inline edit on the candidate profile page. |
| 4 | **Password reset** — permanent lockout for both recruiter and candidate accounts. |
| 5 | **Email delivery** — invite emails, verification, interview reminders — none sent anywhere. |
| 6 | **Automated interview trigger** — `autoInterviewThreshold` is stored but no confirmed backend logic auto-schedules interviews when a candidate's score crosses it. |

### Placeholder / Dummy UI

| # | Item |
|---|------|
| 1 | Audio analysis ("Phase 2" message) — no audio processing runs after recording upload. |
| 2 | Interview Question Bank — full UI built; backend endpoint needs confirmation. |
| 3 | `energyLevel` field collected by backend, never rendered in UI. |
| 4 | LinkedIn "import" is manual paste, not automated scraping. |
| 5 | Tenant impersonation ("coming soon") in admin panel. |
| 6 | Candidate dashboard re-analyse banner clears on a 60 s timer with no real polling. |
| 7 | Candidate portal stage labels use raw Tailwind colours instead of shared `StageBadge` component. |
| 8 | `interviewerQuality` typed as `unknown` — schema not finalised. |

### UX Issues

| # | Issue |
|---|-------|
| 1 | No global search across candidates, jobs, or applications. |
| 2 | No pagination on any list (jobs, candidates, pipeline table). |
| 3 | Jobs empty state passes "Post your first role" link to Hiring Managers → 403. |
| 4 | No invite link copy button after creation or on pending invite rows. |
| 5 | No interview analysis auto-polling (talent tab polls; interview tab does not). |
| 6 | No "Go to job detail" CTA after job creation — only "Go to jobs list". |
| 7 | Candidate portal shows no org name — no context for candidates applying to multiple orgs. |
