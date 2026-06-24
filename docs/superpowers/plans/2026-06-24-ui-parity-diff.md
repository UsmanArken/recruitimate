# UI Parity Diff: Old MVP → Current v2
_Last updated: 2026-06-24_

This file tracks every known frontend difference between the old MVP and the current v2.
Status legend: ✅ Done | 🔲 Pending | ❌ Won't do | ⚠️ Needs decision

---

## 1. SIDEBAR

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 1.1 | Nav order | Dashboard → Jobs → Candidates | Dashboard → Candidates → Jobs | ✅ |
| 1.2 | Settings section | Separate "Settings" heading with 3 links: Client companies, Team & access, Integrations | Removed — only "Team & access" in main nav | ✅ (Settings section restored with Team & access) |
| 1.3 | Client companies link | `/settings/clients` with Building2 icon | Gone | ⚠️ needs decision |
| 1.4 | Integrations link | `/settings/integrations` with Plug icon | Gone | ⚠️ needs decision |

---

## 2. DASHBOARD (`/`)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 2.1 | Header CTA | "Post open role" (Briefcase icon) → `/jobs/new` | "Add candidate" (UserPlus icon) → `/candidates/new` | ✅ |
| 2.2 | Onboarding card | `GettingStartedCard` — dismissible 3-step guide (Post role → Add candidate → Record interview) with checkmarks | Removed entirely | ✅ |
| 2.3 | "Open roles" card | Full card with job list, "Post role" button, clickable rows | Removed entirely | ✅ |
| 2.4 | Stat card 1 | "Open roles" (Briefcase, navy tone) | "People in pipeline" (Users, teal tone) | ✅ |
| 2.5 | Stat card 2 | "People in pipeline" (Users, teal tone) | "Position reviews" (Briefcase, navy tone) | ✅ |
| 2.6 | Stat card 3 | "Position reviews" (Users, sage tone) | "Interviews completed" (Mic, sage tone) — different metric | ✅ (kept Interviews completed) |
| 2.7 | Stat card 4 | "Avg. hire confidence" — shows % score (TrendingUp, slate) | "Evaluations complete" — shows count (TrendingUp, slate) | ✅ (kept Interviews completed, dropped Evaluations) |
| 2.8 | Pipeline activity rows | Shows hire confidence % in bold colored numerals, OR "Awaiting interview" text | Shows plain text recommendation label only | 🔲 (needs hireConfidence field — skip for now) |
| 2.9 | Page description | "Your team's command center for talent review, interview signals, and hire recommendations." (conditional read-only variant) | Same but no read-only variant | ✅ (kept as-is — v2 doesn't have readOnly variant) |

---

## 3. CANDIDATES LIST (`/candidates`)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 3.1 | Bulk resume upload panel | `CandidatesBulkIntakePanel` — full card at top with drag-drop, folder picker, talent pool vs role mode, results display | Removed entirely | ⚠️ needs decision |
| 3.2 | Filter bar | Search (name/email) + role dropdown + stage dropdown + profile status dropdown | Removed entirely | ✅ (search + role + stage filters added; profile status skipped — needs backend field) |
| 3.3 | View toggle | Table ↔ Cards toggle (List + LayoutGrid icons) | Table only, no toggle | ✅ |
| 3.4 | Cards view | 3-col grid cards with avatar, name, role, stage badge, score, "Open talent review →" link | Removed entirely | ✅ |
| 3.5 | Table column 5 | "Talent review" deep-link (`?tab=screen`) | "Decision status" text column | ✅ |
| 3.6 | Table column 6 | None | "Actions" column with `CandidateActionsCell` | ✅ (kept — useful) |
| 3.7 | Page description | "Talent pool and position reviews — upload CVs in bulk or add individuals to open roles." | "One applicant can be in review for multiple open positions — each row is a separate hiring campaign." | ✅ |

---

## 4. CANDIDATE PROFILE (`/candidates/[id]`)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 4.1 | Profile actions | `CandidateProfileActions` — marking dropdown (Active / On Hold / Archived) | Removed; replaced by `DeleteCandidateButton` inline next to name | 🔲 deferred — needs backend field |
| 4.2 | Source profile section | `CandidateSourceProfile` — card showing email, LinkedIn, GitHub, portfolio links + generic screening (skills, experience, strengths, signals) + collapsible resume text + collapsible LinkedIn text | Removed entirely | ✅ (links + collapsible resume; generic screening skipped — app-scoped) |
| 4.3 | Role fit suggestions | `RoleFitSuggestionsPanel` — AI-suggested matching roles based on resume | Removed entirely | 🔲 deferred — needs new LLM call |
| 4.4 | Decision status in applications list | Shows hire confidence % if available, else "Awaiting interview" | Shows recommendation text only | 🔲 |

---

## 5. APPLICATION DETAIL — CORE PAGE (`/candidates/[id]/applications/[applicationId]`)

### 5a. Header

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.1 | Header stickiness | Not sticky — scrolls with page | Sticky (`top-0 z-30`) | 🔲 (keep v2) |
| 5.2 | Header layout | Full-width, large, spacious | `max-w-7xl` container, compact | 🔲 (keep v2) |
| 5.3 | Back link text | "Back to {name}" — `text-sm font-medium` | Just candidate name, `text-xs` | ✅ |
| 5.4 | Avatar size | `lg` (h-14, large) | `sm` (h-8, small) | ✅ |
| 5.5 | Candidate name size | `text-2xl font-bold md:text-3xl` | `text-sm font-bold` | ✅ |
| 5.6 | Stage badge position | Above name | Inline next to name | 🔲 (keep v2) |
| 5.7 | Job title | Separate `bg-brand/8` badge with Briefcase icon below name | Tiny `text-xs` inline next to email | 🔲 |

### 5b. Intelligence Phase Panel (above tabs)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.8 | Phase panel | `IntelligencePhasePanel` — colored banner showing phase, hire confidence score, `RecommendationBadge`, explanation, "Next step" prompt | Removed entirely | ✅ |

### 5c. Tab system

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.9 | Tab count | 3 tabs: Screen / Interview / Decision | 2 tabs: Talent / Interview | ✅ |
| 5.10 | Tab style | Pill buttons in card container, filled teal bg when active, icons + description text | Underline-style in sticky bar, no icons, no descriptions | ✅ |
| 5.11 | Tab URL persistence | `?tab=screen` / `?tab=interview` / `?tab=decision` via `useSearchParams` | No URL persistence, pure `useState` | ✅ |
| 5.12 | Decision tab | Full-width third tab with hire confidence, RecruiterReviewPanel (hire), advisory summary | Removed — verdict in right panel instead | ✅ (recruiter hire review at top, VerdictCard below) |
| 5.13 | Layout | Single full-width column | Two-column: left (tabs) + right sticky panel (verdict + hire review) | ✅ (back to full-width with 3 tabs) |

### 5d. Talent tab (was "Screen" tab)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.14 | Wrapped in Card | Yes — `Card > CardHeader + CardContent` wrapping all talent content | No card wrapper, bare `div.space-y-4` | ❌ (v2 style is cleaner without wrapper) |
| 5.15 | Score display | `ScoreBadge` grid (large number + label + bar in a card) | `FitMeter` (% + thin progress bar) in a 3px left-border card | ✅ (keep v2) |
| 5.16 | "Recruitimate review" label | Shows `span` "Recruitimate review" next to LayerBadge | Removed | ✅ |
| 5.17 | Recruiter talent review panel | `RecruiterReviewPanel kind="talent"` shown below talent content | ✅ **Done** (just added) | ✅ |

### 5e. Interview tab

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.18 | Interview scores style | `ScoreBadge` grid — 5 badges (Confidence / Clarity / Hesitation / Consistency / Engagement) | `ScoreRow` list + `SignalRadar` pentagon chart | 🔲 (keep v2) |
| 5.19 | Score fields | confidenceScore, clarityScore, hesitationScore, consistencyScore, engagementScore | confidenceScore, clarityScore, pacingScore, fillerScore, emotionalVariance | ✅ (schema redesign, keep v2) |
| 5.20 | Truthfulness section | Risk flags shown inline as `SignalList` labeled "Follow-up suggested" | Dedicated `EvidenceSection` with `ScoreHero` + warning triangle flags | ✅ (keep v2) |
| 5.21 | Answer depth section | Not present | New `EvidenceSection` with `ScoreHero` + depth notes + work style notes | ✅ (keep v2) |
| 5.22 | Resume consistency section | Not present | New `EvidenceSection` with `ScoreHero` + inconsistencies list | ✅ (keep v2) |
| 5.23 | Transcript | Not shown inline | `TranscriptDrawer` collapsible per interview | ✅ (keep v2) |
| 5.24 | Interviewer quality | Shown inline | Collapsed by default in `Collapsible` wrapper | ✅ (keep v2) |
| 5.25 | Audio signals panel | `AudioSignalsPanel` — pause density, energy variability, pause count, longest pause, detected pauses list, tone shifts | Removed — audio scores integrated into score rows | ✅ (keep v2) |
| 5.26 | Video behavioral panel | `VideoBehavioralPanel` — engagement, attention, face visibility | Removed entirely | ✅ (keep v2) |
| 5.27 | Video behavioral capture | `VideoBehavioralCapturePanel` — opt-in consent + webcam capture | Removed entirely | ✅ (keep v2) |
| 5.28 | Live interview assist | `LiveInterviewAssistPanel` — real-time speech capture, follow-up suggestions, mismatch alerts | Removed entirely | ❌ won't carry over |
| 5.29 | Multiple interviews | Only latest shown | All shown, each with their own analysis tabs | ✅ (keep v2) |

### 5f. Decision / Verdict

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 5.30 | Location | Third tab (full-width) | Right sticky panel alongside all tabs | ✅ (keep v2) |
| 5.31 | Hire confidence score | `ScoreBadge` showing hire confidence % | Removed (field dropped) | ✅ (keep v2) |
| 5.32 | Recruiter hire decision panel | `RecruiterReviewPanel kind="hire"` at top of Decision tab | ✅ **Done** (just added to right panel) | ✅ |
| 5.33 | Recommendation display | `RecommendationBadge` + `ScoreBadge` grid | Colored banner (HIRE/LEAN_HIRE/HOLD/LEAN_REJECT/REJECT) | ✅ (keep v2) |
| 5.34 | Reasons for/against | Not present | New two-column "For" / "Against" grid | ✅ (keep v2) |
| 5.35 | Stage action buttons | Not in old decision UI | "Shortlist" + "Reject" buttons | ✅ (keep v2) |

---

## 6. JOBS PAGE (`/jobs`)

| # | Difference | Old MVP | Current v2 | Status |
|---|---|---|---|---|
| 6.1 | Client company filter | Dropdown filter (if multiple clients exist) | Removed | 🔲 deferred — needs client field on Job model |
| 6.2 | View toggle | Cards ↔ List toggle | Cards only | ✅ |
| 6.3 | List view | Briefcase icon + title + "client · X in pipeline" + ArrowRight row | Removed | ✅ (added without client label) |
| 6.4 | Card design — title | `CardTitle` (`text-lg`) only | Icon box (Briefcase in bg-brand/10) + `CardTitle` + `CardDescription` line-clamp-2 + ArrowRight | 🔲 (keep v2 — better) |
| 6.5 | Card footer | "X in pipeline" text (no icon) | "X applicants in pipeline · Manage team →" with Users icon | 🔲 (keep v2 — better) |
| 6.6 | Page description | "Hiring campaigns by client company — score candidates against each requisition." | "Define positions to power role-fit scoring and keep candidates organized by requisition." | ✅ |
| 6.7 | Empty state secondary action | "Add client company" → `/settings/clients` | "Back to dashboard" → `/` | ✅ (changed to "Team & access") |

---

## 7. REMOVED COMPONENTS (old MVP only)

These exist in old version but not in v2. Each needs a decision.

| # | Component | What it did | Status |
|---|---|---|---|
| 7.1 | `GettingStartedCard` | 3-step onboarding checklist on dashboard, dismissible via localStorage | ⚠️ needs decision |
| 7.2 | `CandidatesBulkIntakePanel` | Drag-drop bulk resume import (talent pool or role mode) | ⚠️ needs decision |
| 7.3 | `CandidatesPipelineView` | Pipeline view with search + 4 filters + table/cards toggle | ⚠️ needs decision |
| 7.4 | `CandidateSourceProfile` | Profile & source materials card (links, generic screening, collapsible resume/LinkedIn text) | ⚠️ needs decision |
| 7.5 | `CandidateProfileActions` | Candidate marking dropdown (Active / On Hold / Archived) | ⚠️ needs decision |
| 7.6 | `RoleFitSuggestionsPanel` | AI-suggested matching roles for a candidate based on resume | ⚠️ needs decision |
| 7.7 | `IntelligencePhasePanel` | Phase-status banner above tabs (preliminary screening vs ready for decision) | ⚠️ needs decision |
| 7.8 | `ApplicationDetailTabs` | 3-tab pill switcher (Screen/Interview/Decision) with URL persistence | ⚠️ needs decision |
| 7.9 | `LiveInterviewAssistPanel` | Real-time speech capture + AI follow-up questions during live interview | ⚠️ needs decision |
| 7.10 | `JobsListView` (with toggle) | Jobs cards/list toggle + client company filter | ⚠️ needs decision |

---

## Summary by Priority

### High impact (visible in demos, core workflow)
- 5.8 IntelligencePhasePanel — phase status above tabs
- 5.9 / 5.12 — 3rd Decision tab vs right panel layout
- 3.1–3.4 — Candidates list filters, search, bulk upload, cards view
- 2.3 — Open roles card on dashboard
- 7.9 — Live interview assist panel

### Medium impact (UX polish)
- 2.1–2.9 — Dashboard stat cards and CTA
- 4.1–4.3 — Candidate profile sections
- 5.3–5.5 — Header back link text and name size
- 6.1–6.3 — Jobs page filter/toggle

### Low impact (copy/description text)
- 3.7, 6.6, 6.7 — Page description text changes
