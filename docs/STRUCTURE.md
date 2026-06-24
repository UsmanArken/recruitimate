# Recruitimate — Codebase Structure

Standard layered architecture for Next.js App Router. Routes stay thin; business logic lives in services; intelligence engines remain isolated.

## Directory tree

```
src/
├── app/                              # Routing & HTTP only
│   ├── api/                          # Thin route handlers
│   ├── candidates/                   # Server pages
│   ├── jobs/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                           # Primitives (Button, Card)
│   ├── layout/                       # AppShell, Sidebar, PageHeader
│   └── features/                     # Domain UI
│       ├── candidates/               # Avatar, StageBadge, InterviewForm
│       ├── dashboard/                # StatCard
│       └── intelligence/             # LayerBadge, ScoreBadge, SignalList
│
└── lib/
    ├── api/                          # response.ts, errors.ts, request.ts
    ├── config/                       # env.ts
    ├── db/                           # includes.ts (Prisma include shapes)
    ├── validators/                   # Zod schemas (shared API + forms)
    ├── auth/                         # Session, DB permission engine, scope
    ├── services/                     # Business orchestration
    │   ├── candidate.service.ts
    │   ├── interview.service.ts
    │   ├── job.service.ts
    │   ├── dashboard.service.ts
    │   ├── talent-profile.service.ts
    │   └── decision.service.ts
    ├── intelligence/                 # Core moat (unchanged boundary)
    │   ├── talent/engine.ts
    │   ├── interview/engine.ts
    │   ├── decision/engine.ts
    │   ├── mappers.ts
    │   ├── ai.ts
    │   └── types.ts
    ├── db.ts
    └── utils.ts
```

## Layer responsibilities

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **app/api/** | Parse request → call service → JSON response | `POST /api/candidates` |
| **app/** pages | Server UI → call services (no Prisma in pages) | `getDashboardData()` |
| **services/** | Orchestration, transactions, pipeline flows | `createCandidate()` |
| **intelligence/** | Pure AI/signal logic, no HTTP | `analyzeTalent()` |
| **validators/** | Input contracts | `createCandidateSchema` |
| **db/includes.ts** | Reusable Prisma `include` shapes | `candidateDetailInclude` |

## Data flow

```
HTTP Request
  → app/api/route.ts
  → validators (Zod)
  → service.*
  → intelligence engines (when needed)
  → Prisma (inside services only)
  → response helper
```

## Rules for new code

1. **Do not** add Prisma queries in `app/api` or pages — use a service.
2. **Do not** duplicate Zod schemas — add to `lib/validators/`.
3. **Do not** put feature components in `app/` — use `components/features/`.
4. **Do** keep intelligence logic in `lib/intelligence/` (portable to workers later).
5. **Do** use `AppError` + `handleRouteError` in API routes.

## Authentication & ACL

See **[AUTH-ACL.md](./AUTH-ACL.md)** for the full RBAC guide (roles, permission matrix, data scoping, team management). Permissions live in `Role` + `Permission` + `RolePermission` tables (database rule engine). Enforced in `lib/auth/permission.service.ts`, `lib/auth/scope.service.ts`, and `lib/services/*` via `AuthContext`.
