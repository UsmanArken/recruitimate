# Recruitimate

**AI-Native Hiring OS** — talent intelligence + interview intelligence + decision intelligence.

> Signal-based. AI-assisted. Decision-driven.  
> We show signals, not judgments. Every score is explainable.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 Layer 1: Talent Intelligence (Pre-Interview)          │
│     Resume → skills, fit score, strengths/gaps, signals     │
├─────────────────────────────────────────────────────────────┤
│  🎤 Layer 2: Interview Intelligence (Core Moat)           │
│     Transcript → hesitation, confidence, clarity, flags     │
├─────────────────────────────────────────────────────────────┤
│  📊 Layer 3: Decision Intelligence (Final Output)         │
│     Talent + Interview → hire confidence, recommendation  │
└─────────────────────────────────────────────────────────────┘
```

### MVP (this repo)

| Module | Status |
|--------|--------|
| Talent Intelligence (resume parsing, fit score) | ✅ |
| Interview Intelligence (transcript post-analysis) | ✅ |
| Decision Intelligence (summary, risk flags, scoring) | ✅ |
| ATS-lite (jobs, pipeline stages) | ✅ |
| Real-time interview assist | Phase 2 |
| Outreach / Discovery engines | Phase 2+ |

## Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Prisma
- **OpenAI** (optional — heuristic fallback without API key)
- **Tailwind CSS 4**

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start Postgres
docker compose up -d

# 3. Configure environment
cp .env.example .env
# Add OPENAI_API_KEY for AI-powered analysis (optional for dev)

# 4. Push database schema
npm run db:push

# 5. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Typical flow

1. **Create a job** → `/jobs/new` (enables role fit scoring)
2. **Add candidate** → paste resume → Talent Intelligence runs automatically
3. **Add interview** → paste transcript on candidate page → Interview + Decision layers update

## Project structure

```
src/
├── app/                    # Pages & API routes
├── components/             # UI (minimal, explainable)
└── lib/
    └── intelligence/       # Core moat
        ├── talent/           # Layer 1 engine
        ├── interview/      # Layer 2 engine
        └── decision/       # Layer 3 engine
prisma/schema.prisma        # Data model
```

## Design principles

1. **Explain everything** — every signal includes evidence + confidence level
2. **Assist, don't replace** — recommendations are advisory
3. **No deception claims** — we avoid "truthfulness" detection in MVP
4. **Minimal UI** — three layers visible on every candidate profile

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | No | Enables GPT-4o-mini analysis (fallback heuristics without it) |

## License

Proprietary — All rights reserved.
