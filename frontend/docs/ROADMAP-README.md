# Recruitimate Roadmap (CSV)

## File

[`recruitimate-roadmap.csv`](./recruitimate-roadmap.csv)

## Columns

| Column | Description |
|--------|-------------|
| **ID** | Unique task ID (prefix: F=Foundation, MVP, P2, P3, CP) |
| **Milestone** | Foundation · MVP · Phase 2 · Phase 3 · Complete Product |
| **Category** | Product area (e.g. Talent Intelligence, Outreach) |
| **Layer** | Talent · Interview · Decision · — |
| **Task** | Short title |
| **Description** | What “done” means |
| **Priority** | P0 (critical) · P1 · P2 · P3 |
| **Status** | `Done` · `In Progress` · `Not Started` · `Blocked` · `Cancelled` |
| **Depends On** | Other task IDs |
| **Notes** | Extra context |

## Milestones (summary)

### Foundation
Project setup, docs, HR UI shell — **complete**.

### MVP (Phase 1) — ship to first recruiters
**Goal:** Talent + post-interview analysis + decision dashboard + ATS-lite.

- **Done:** Core engines, auth/ACL, multi-position applications, PDF resume upload, phased intelligence, applicant intake picker, QA scripts, platform admin, operator workspace guard, notes, onboarding, multi-provider LLM, **production deploy** (MVP-035), **bulk resume screening** (MVP-041), demo UI polish (MVP-042), branding (MVP-043).
- **Remaining:** GitHub/portfolio parsing (MVP-025) optional.

**Production:** https://recruitimate.app (recruitimate.io redirects)

### Phase 2 — core moat expansion
**Goal:** Real-time interview assist, cross-signal validation, media pipeline, discovery, outreach, assessments, copilot.

- **Done (interview layer):** P2-001 through P2-008 merged to `main` (live assist, cross-signal, question bank, interviewer quality, audio/video signals).
- **Not started:** Discovery (P2-009–011), outreach (P2-012–014), assessments (P2-015–017), copilot (P2-018–020), media pipeline (P2-021–022), Kanban (P2-023).

### Phase 3 — learning & scale
**Goal:** Outcome learning, predictive success, org analytics, multi-tenant.

### Complete Product (1.0)
**Goal:** Full 9-module vision, enterprise integrations, compliance, production scale, commercial readiness.

## Updating status

Open the CSV in Excel, Google Sheets, or Cursor — change the **Status** column as work completes. Keep **Depends On** accurate when sequencing work.

Use `|` in **Depends On** when a task has multiple prerequisites (e.g. `MVP-014|MVP-023`).

### MVP status snapshot (verified against codebase)

| Status | Count | Notes |
|--------|------:|-------|
| **Done** | 46 | All MVP-* except MVP-025 |
| **Not Started** | 1 | MVP-025 GitHub/portfolio parsing |

Foundation (F-001–F-009) and shipped Phase 3 items (P3-009, P3-010, CP-024) are **Done** as marked.

### Phase 2 interview snapshot

| Status | Count | IDs |
|--------|------:|-----|
| **Done** | 8 | P2-001–P2-008 |
| **Not Started** | 17 | P2-009–P2-025 |

## Suggested MVP exit criteria

All tasks with ID `MVP-*` at **Done** — **met** except optional MVP-025.

Key shipped items:

- MVP-028 Authentication · MVP-029c Platform super admin · MVP-029d Operator workspace guard  
- MVP-015b Multi-position applications · MVP-036 Phased intelligence  
- MVP-023 Resume PDF upload · MVP-037 Applicant intake picker · MVP-041 Bulk screening  
- MVP-034 QA test plan · MVP-035 Production deployment  
- MVP-024 LinkedIn ingestion · MVP-027 Scheduling · MVP-030/031 Recording + Whisper  
- MVP-033 Request logging · MVP-040 Multi-provider LLM · MVP-042/043 UI polish + branding  
