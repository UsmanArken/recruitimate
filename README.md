# Recruitimate

**AI-Native Hiring OS** — talent intelligence + interview intelligence + decision intelligence.

> Signal-based. AI-assisted. Decision-driven.
> We show signals, not judgments. Every score is explainable.

---

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Talent Intelligence (Pre-Interview)               │
│     Resume → skills, fit score, strengths/gaps, signals     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Interview Intelligence (Core Moat)                │
│     Transcript → hesitation, confidence, clarity, flags     │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Decision Intelligence (Final Output)              │
│     Talent + Interview → hire confidence, recommendation    │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 |
| Backend | FastAPI + Python 3.11+ |
| Database | PostgreSQL 16 + SQLAlchemy (async) + Alembic |
| Auth | JWT (python-jose + passlib) |
| AI | OpenAI / Anthropic / Google Gemini (auto-resolved) |
| Transcription | OpenAI Whisper (optional) |

---

## Project structure

```
recruitimate/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   ├── components/    # UI + feature components
│   │   └── lib/           # apiFetch, serverFetch, auth-client
│   ├── next.config.ts     # Proxies /api/* → FastAPI in dev
│   └── package.json
└── backend/           # FastAPI app
    ├── app/
    │   ├── core/          # config, database, security, dependencies
    │   ├── features/      # auth, jobs, candidates, applications,
    │   │                  # interviews, invites, admin, roles,
    │   │                  # resume, linkedin, llm, intelligence
    │   └── shared/        # SQLAlchemy models, permissions, storage
    ├── alembic/           # Database migrations
    ├── tests/             # pytest integration tests
    └── pyproject.toml
```

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for Postgres)

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. Set up the backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg alembic \
  pydantic-settings email-validator "python-jose[cryptography]" "passlib[bcrypt]" \
  "bcrypt==4.0.1" python-multipart openai anthropic pypdf python-docx \
  httpx icalendar pytest pytest-asyncio aiosqlite

# Configure environment
cp .env.example .env
# Edit .env — set AUTH_SECRET and at least one LLM API key

# Run database migrations
alembic revision --autogenerate -m "initial schema"
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
# API running at http://localhost:8000
# Interactive docs at http://localhost:8000/api/docs
```

### 3. Set up the frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# FASTAPI_URL=http://localhost:8000 is already the default

# Start the dev server
npm run dev
# App running at http://localhost:3000
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@localhost:5432/recruitimate` |
| `AUTH_SECRET` | Yes | Long random string for JWT signing (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes | Backend base URL (`http://localhost:8000`) |
| `LLM_PROVIDER` | No | `auto` \| `openai` \| `anthropic` \| `google` (default: `auto`) |
| `OPENAI_API_KEY` | No* | Required if using OpenAI |
| `ANTHROPIC_API_KEY` | No* | Required if using Anthropic |
| `GOOGLE_API_KEY` | No* | Required if using Google Gemini |
| `TRANSCRIPTION_PROVIDER` | No | `none` \| `openai` (default: `none`) |
| `UPLOAD_DIR` | No | Path for interview recordings (default: `./uploads`) |
| `SUPER_ADMIN_EMAIL` | No | Platform operator admin email |
| `SUPER_ADMIN_PASSWORD` | No | Platform operator admin password |

*At least one LLM key required for AI features. Without any key, intelligence engines return empty fallback results.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `FASTAPI_URL` | No | Backend URL for Next.js dev proxy (default: `http://localhost:8000`) |
| `NEXT_PUBLIC_API_URL` | No | Public API base URL (empty = use Next.js proxy) |

---

## Typical flow

1. **Sign up** → creates your organization workspace
2. **Post a job** → `/jobs/new` (defines role requirements for fit scoring)
3. **Add a candidate** → upload PDF/DOCX resume → Talent Intelligence runs automatically
4. **Schedule an interview** → use live assist during the call
5. **Analyze** → paste transcript → Interview + Decision layers update
6. **Decide** → hire confidence score + committee recommendations

---

## Running tests

```bash
cd backend
.venv\Scripts\activate

# Tests use SQLite in-memory — no Postgres needed
pytest tests/ -v
```

All 24 integration tests cover: auth, jobs, candidates, applications, interviews.

---

## API reference

With the backend running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

---

## Design principles

1. **Explain everything** — every signal includes evidence and confidence
2. **Assist, don't replace** — all recommendations are advisory
3. **No deception claims** — we avoid "lie detection" or similar in scoring
4. **Minimal UI** — three intelligence layers visible on every candidate profile

---

## License

Proprietary — All rights reserved.
