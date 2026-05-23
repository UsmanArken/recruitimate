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
Project setup, docs, HR UI shell — **mostly complete**.

### MVP (Phase 1) — ship to first recruiters
**Goal:** Talent + post-interview analysis + decision dashboard + ATS-lite.

- **Done:** Core engines, auth/ACL, multi-position applications (`JobApplication`), PDF resume upload, phased intelligence, applicant intake picker, QA scripts, platform admin.
- **Remaining for a shippable MVP:** Notes UI (MVP-026), error handling (MVP-033), empty states (MVP-032), staging deploy (MVP-035).

### Phase 2 — core moat expansion
**Goal:** Real-time interview assist, cross-signal validation, media pipeline, discovery, outreach, assessments, copilot.

### Phase 3 — learning & scale
**Goal:** Outcome learning, predictive success, org analytics, multi-tenant.

### Complete Product (1.0)
**Goal:** Full 9-module vision, enterprise integrations, compliance, production scale, commercial readiness.

## Updating status

Open the CSV in Excel, Google Sheets, or Cursor — change the **Status** column as work completes. Keep **Depends On** accurate when sequencing work.

## Suggested MVP exit criteria

All tasks with ID `MVP-*` at **Done**, especially:

- MVP-028 Authentication · MVP-029c Platform super admin  
- MVP-015b Multi-position applications · MVP-036 Phased intelligence  
- MVP-023 Resume PDF upload · MVP-037 Applicant intake picker  
- MVP-034 QA test plan  
- MVP-033 Error handling · MVP-035 MVP deployment (still open)  
