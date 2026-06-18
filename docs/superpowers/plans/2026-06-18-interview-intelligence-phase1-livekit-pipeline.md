# Interview Intelligence — Phase 1: LiveKit Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dummy `meetingUrl` field with a real LiveKit-powered video call: recruiter creates an interview → backend provisions a LiveKit room → both recruiter and candidate get join URLs → in-app video call works → LiveKit Agent joins silently → audio `.wav` exported to Cloudflare R2 on session end → Celery task enqueued for Phase 2 analysis.

**Architecture:** Three separate processes — FastAPI (API), LiveKit Agent (room worker), Celery (analysis pipeline, already exists). FastAPI provisions rooms via LiveKit REST API. Agent connects to LiveKit Cloud via persistent WebSocket, joins every room as a silent participant, triggers Egress on room end, then enqueues a Celery task with `(interview_id, audio_url)`. Frontend video call at `/interview/[roomId]` works for both recruiter (authenticated) and candidate (magic link token in URL).

**Tech Stack:** `livekit-server-sdk` (Python, room management + token generation), `livekit-agents` (Python, Agent worker), `@livekit/components-react` + `livekit-client` (frontend video UI), Cloudflare R2 (S3-compatible audio storage), existing Celery + Redis.

## Global Constraints

- Branch: `fastapi-migration` — all commits go here
- Backend: Python/FastAPI, async SQLAlchemy, Alembic migrations
- Frontend: Next.js 14 App Router, TypeScript, Tailwind CSS
- LiveKit: Cloud-hosted (not self-hosted), agent observability enabled
- Audio storage: Cloudflare R2 via S3-compatible API
- No email sending in Phase 1 — recruiter copies candidate join link manually
- `InterviewStatus` enum: add `IN_PROGRESS` and `COMPLETED` states (alongside existing `SCHEDULED`, `ANALYZED`)
- Tokens are NOT stored in DB — regenerated on demand from `livekitRoomName`

---

## Files to Create

| File | Purpose |
|------|---------|
| `backend/app/features/livekit/__init__.py` | Package marker |
| `backend/app/features/livekit/client.py` | LiveKit REST API wrapper (room create, token generate, egress trigger) |
| `backend/app/agent/__init__.py` | Package marker |
| `backend/app/agent/worker.py` | LiveKit Agent entry point — joins rooms, triggers egress, enqueues Celery |
| `backend/alembic/versions/<hash>_interview_livekit_fields.py` | Migration: add livekitRoomName, candidateJoinUrl, audioUrl, agentStatus to Interview |
| `frontend/src/app/interview/[roomId]/page.tsx` | Video call page (shared recruiter + candidate) |
| `frontend/src/app/interview/[roomId]/video-call.tsx` | Client component wrapping LiveKit React SDK |
| `frontend/src/lib/api-interview.ts` | Fetch helper for interview token endpoint |

## Files to Modify

| File | Change |
|------|--------|
| `backend/app/shared/models.py` | Add 4 fields to `Interview`, add `IN_PROGRESS`/`COMPLETED` to `InterviewStatus` enum |
| `backend/app/core/config.py` | Add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` |
| `backend/app/features/interviews/service.py` | Replace dummy `meetingUrl` creation with LiveKit room provisioning |
| `backend/app/features/interviews/router.py` | Add `GET /{interview_id}/token` endpoint (generate fresh join token) |
| `backend/app/features/interviews/schemas.py` | Add `livekitRoomName`, `candidateJoinUrl`, `agentStatus` to serialized response |
| `backend/app/workers/tasks.py` | Add `process_interview_audio(interview_id, audio_url)` task stub (Phase 2 fills it) |
| `backend/pyproject.toml` | Add `livekit`, `livekit-agents`, `boto3` dependencies |
| `frontend/src/app/candidates/[id]/applications/[applicationId]/page.tsx` | Replace meetingUrl display with "Join Interview" button that fetches a fresh token |
| `frontend/package.json` | Add `@livekit/components-react`, `livekit-client` |
| `backend/.env.example` | Add all new env vars |

---

## Task 1: Schema + Migration

**Files:**
- Modify: `backend/app/shared/models.py`
- Create: `backend/alembic/versions/<hash>_interview_livekit_fields.py`

**Interfaces:**
- Produces: `Interview.livekitRoomName`, `Interview.candidateJoinUrl`, `Interview.audioUrl`, `Interview.agentStatus`, `InterviewStatus.IN_PROGRESS`, `InterviewStatus.COMPLETED`

- [ ] **Step 1: Update `InterviewStatus` enum in `models.py`**

```python
class InterviewStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ANALYZED = "ANALYZED"
```

- [ ] **Step 2: Add 4 fields to `Interview` model in `models.py`**

Add after `transcript: Mapped[str | None]`:
```python
livekitRoomName: Mapped[str | None] = mapped_column(String)
candidateJoinUrl: Mapped[str | None] = mapped_column(String)
audioUrl: Mapped[str | None] = mapped_column(String)
agentStatus: Mapped[str] = mapped_column(String, default="pending")
# agentStatus values: "pending" | "joined" | "finished" | "failed"
```

- [ ] **Step 3: Generate migration**

Run from `backend/`:
```bash
alembic revision --autogenerate -m "interview_livekit_fields"
```

- [ ] **Step 4: Review the generated migration**

Open the generated file. Verify it adds the 4 columns and alters the `InterviewStatus` enum. The enum ALTER may need manual SQL if Postgres doesn't support `ADD VALUE` via Alembic autogenerate. If so, manually add:
```python
# In upgrade():
op.execute("ALTER TYPE interviewstatus ADD VALUE IF NOT EXISTS 'IN_PROGRESS'")
op.execute("ALTER TYPE interviewstatus ADD VALUE IF NOT EXISTS 'COMPLETED'")
```

- [ ] **Step 5: Apply migration**

```bash
alembic upgrade head
```

Expected: no errors, `Interview` table has 4 new columns.

- [ ] **Step 6: Commit**

```bash
git add backend/app/shared/models.py backend/alembic/versions/
git commit -m "feat: add LiveKit fields to Interview model"
```

---

## Task 2: Config + Dependencies

**Files:**
- Modify: `backend/app/core/config.py`
- Modify: `backend/pyproject.toml`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces: `settings.LIVEKIT_URL`, `settings.LIVEKIT_API_KEY`, `settings.LIVEKIT_API_SECRET`, `settings.R2_ACCOUNT_ID`, `settings.R2_ACCESS_KEY_ID`, `settings.R2_SECRET_ACCESS_KEY`, `settings.R2_BUCKET_NAME`

- [ ] **Step 1: Add settings to `config.py`**

Add to the `Settings` class:
```python
LIVEKIT_URL: str = "wss://your-project.livekit.cloud"
LIVEKIT_API_KEY: str = ""
LIVEKIT_API_SECRET: str = ""
R2_ACCOUNT_ID: str = ""
R2_ACCESS_KEY_ID: str = ""
R2_SECRET_ACCESS_KEY: str = ""
R2_BUCKET_NAME: str = "recruitimate-audio"
R2_ENDPOINT_URL: str = ""  # https://<account_id>.r2.cloudflarestorage.com
```

- [ ] **Step 2: Add dependencies to `pyproject.toml`**

In the `[project] dependencies` list add:
```toml
"livekit>=0.11",
"livekit-agents>=0.8",
"boto3>=1.34",
```

- [ ] **Step 3: Install**

```bash
pip install livekit livekit-agents "boto3>=1.34"
```

- [ ] **Step 4: Update `.env.example`**

```
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=recruitimate-audio
R2_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
```

- [ ] **Step 5: Fill in your `.env` with real values**

From LiveKit Cloud dashboard: copy `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
From Cloudflare R2 dashboard: create bucket `recruitimate-audio`, create API token with R2 read+write, copy credentials.

- [ ] **Step 6: Commit**

```bash
git add backend/app/core/config.py backend/pyproject.toml backend/.env.example
git commit -m "feat: add LiveKit and R2 config settings"
```

---

## Task 3: LiveKit Client Wrapper

**Files:**
- Create: `backend/app/features/livekit/__init__.py`
- Create: `backend/app/features/livekit/client.py`

**Interfaces:**
- Consumes: `settings.LIVEKIT_URL`, `settings.LIVEKIT_API_KEY`, `settings.LIVEKIT_API_SECRET`
- Produces:
  - `create_room(room_name: str) -> None`
  - `generate_token(room_name: str, participant_identity: str, participant_name: str, is_agent: bool = False) -> str`
  - `trigger_egress(room_name: str, interview_id: str) -> str` — returns egress job ID
  - `build_join_url(token: str, base_url: str) -> str`

- [ ] **Step 1: Create `__init__.py`**

Empty file: `backend/app/features/livekit/__init__.py`

- [ ] **Step 2: Create `client.py`**

```python
from livekit import api
from app.core.config import settings


def _lk_api() -> api.LiveKitAPI:
    return api.LiveKitAPI(
        url=settings.LIVEKIT_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )


async def create_room(room_name: str) -> None:
    async with _lk_api() as lk:
        await lk.room.create_room(
            api.CreateRoomRequest(name=room_name, empty_timeout=300, max_participants=10)
        )


def generate_token(
    room_name: str,
    participant_identity: str,
    participant_name: str,
    is_agent: bool = False,
) -> str:
    token = api.AccessToken(
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    grants = api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=not is_agent,
        can_subscribe=True,
        hidden=is_agent,
        agent=is_agent,
    )
    token.with_identity(participant_identity).with_name(participant_name).with_grants(grants)
    return token.to_jwt()


async def trigger_egress(room_name: str, audio_output_key: str) -> str:
    async with _lk_api() as lk:
        resp = await lk.egress.start_room_composite_egress(
            api.RoomCompositeEgressRequest(
                room_name=room_name,
                audio_only=True,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.OGG,
                        filepath=audio_output_key,
                        s3=api.S3Upload(
                            access_key=settings.R2_ACCESS_KEY_ID,
                            secret=settings.R2_SECRET_ACCESS_KEY,
                            bucket=settings.R2_BUCKET_NAME,
                            endpoint=settings.R2_ENDPOINT_URL,
                            region="auto",
                        ),
                    )
                ],
            )
        )
    return resp.egress_id


def build_join_url(token: str) -> str:
    base = settings.NEXT_PUBLIC_APP_URL if hasattr(settings, "NEXT_PUBLIC_APP_URL") else "http://localhost:3000"
    # Token is passed as query param — frontend reads it to connect
    # Room name is encoded inside the token itself
    return f"{base}/interview/join?token={token}"
```

- [ ] **Step 3: Verify import works**

```bash
cd backend
python -c "from app.features.livekit.client import generate_token; print('ok')"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add backend/app/features/livekit/
git commit -m "feat: add LiveKit client wrapper"
```

---

## Task 4: Interview Service + Router — LiveKit Room Provisioning

**Files:**
- Modify: `backend/app/features/interviews/service.py`
- Modify: `backend/app/features/interviews/router.py`
- Modify: `backend/app/features/interviews/schemas.py`

**Interfaces:**
- Consumes: `create_room()`, `generate_token()`, `build_join_url()` from `app.features.livekit.client`
- Produces:
  - `create_interview()` now returns `livekitRoomName`, `candidateJoinUrl`, `recruiterJoinUrl`
  - `GET /{interview_id}/token` → `{ token: str, joinUrl: str }` — fresh token on demand

- [ ] **Step 1: Update `_serialize()` in `service.py`**

```python
def _serialize(i: Interview) -> dict:
    return {
        "id": i.id,
        "applicationId": i.applicationId,
        "title": i.title,
        "status": i.status,
        "scheduledAt": i.scheduledAt,
        "durationMinutes": i.durationMinutes,
        "meetingUrl": i.meetingUrl,
        "transcript": i.transcript,
        "livekitRoomName": i.livekitRoomName,
        "candidateJoinUrl": i.candidateJoinUrl,
        "audioUrl": i.audioUrl,
        "agentStatus": i.agentStatus,
        "createdAt": i.createdAt,
    }
```

- [ ] **Step 2: Update `create_interview()` in `service.py`**

```python
async def create_interview(app_id: str, org_id: str, data: dict, db: AsyncSession) -> dict:
    from app.features.livekit.client import create_room, generate_token, build_join_url
    import uuid

    result = await db.execute(
        select(JobApplication)
        .where(JobApplication.id == app_id, JobApplication.organizationId == org_id)
        .options(selectinload(JobApplication.candidate))
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    room_name = f"interview-{uuid.uuid4().hex[:12]}"
    await create_room(room_name)

    candidate_name = app.candidate.name if app.candidate else "Candidate"
    candidate_token = generate_token(
        room_name=room_name,
        participant_identity=f"candidate-{app.candidateId}",
        participant_name=candidate_name,
    )
    candidate_join_url = build_join_url(candidate_token)

    interview = Interview(
        applicationId=app_id,
        livekitRoomName=room_name,
        candidateJoinUrl=candidate_join_url,
        agentStatus="pending",
        **data,
    )
    db.add(interview)
    await db.flush()

    # Generate recruiter token (not stored — regenerated via /token endpoint)
    recruiter_token = generate_token(
        room_name=room_name,
        participant_identity=f"recruiter-{org_id}",
        participant_name="Recruiter",
    )
    recruiter_join_url = build_join_url(recruiter_token)

    serialized = _serialize(interview)
    serialized["recruiterJoinUrl"] = recruiter_join_url
    return serialized
```

- [ ] **Step 3: Add `get_interview_token()` to `service.py`**

```python
async def get_interview_token(
    interview_id: str, app_id: str, org_id: str, user_identity: str, user_name: str, db: AsyncSession
) -> dict:
    from app.features.livekit.client import generate_token, build_join_url

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.livekitRoomName:
        raise HTTPException(status_code=400, detail="Interview has no LiveKit room")

    token = generate_token(
        room_name=interview.livekitRoomName,
        participant_identity=user_identity,
        participant_name=user_name,
    )
    return {"token": token, "joinUrl": build_join_url(token), "roomName": interview.livekitRoomName}
```

- [ ] **Step 4: Add token endpoint to `router.py`**

```python
@router.get("/{interview_id}/token")
async def get_token(
    application_id: str,
    interview_id: str,
    auth: CurrentUser,
    db: DB,
):
    return await service.get_interview_token(
        interview_id=interview_id,
        app_id=application_id,
        org_id=auth.organization_id,
        user_identity=f"recruiter-{auth.user_id}",
        user_name=auth.name or "Recruiter",
        db=db,
    )
```

- [ ] **Step 5: Test room creation manually**

Start the backend: `uvicorn app.main:app --reload`

Create an interview via the API:
```bash
curl -X POST http://localhost:8000/api/applications/{app_id}/interviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Interview", "scheduledAt": "2026-07-01T10:00:00Z"}'
```

Expected response includes `livekitRoomName`, `candidateJoinUrl`, `recruiterJoinUrl`.

Verify room appears in LiveKit Cloud dashboard.

- [ ] **Step 6: Commit**

```bash
git add backend/app/features/interviews/
git commit -m "feat: provision LiveKit room on interview creation"
```

---

## Task 5: Celery Task Stub for Audio Processing

**Files:**
- Modify: `backend/app/workers/tasks.py`

**Interfaces:**
- Produces: `process_interview_audio(interview_id: str, audio_url: str)` — stub that Phase 2 fills

- [ ] **Step 1: Add task stub to `tasks.py`**

```python
@celery_app.task(name="process_interview_audio")
def process_interview_audio(interview_id: str, audio_url: str) -> None:
    """
    Phase 2 fills this in with AssemblyAI transcription + Gemini audio analysis.
    For now: just update agentStatus to 'finished' and store the audio URL.
    """
    from app.core.database import SyncSessionLocal
    from app.shared.models import Interview

    with SyncSessionLocal() as db:
        interview = db.get(Interview, interview_id)
        if interview:
            interview.audioUrl = audio_url
            interview.agentStatus = "finished"
            db.commit()
```

- [ ] **Step 2: Verify Celery picks it up**

```bash
celery -A app.workers.celery_app worker --loglevel=info
```

Expected: task `process_interview_audio` appears in registered tasks list.

- [ ] **Step 3: Commit**

```bash
git add backend/app/workers/tasks.py
git commit -m "feat: add process_interview_audio Celery task stub"
```

---

## Task 6: LiveKit Agent Worker

**Files:**
- Create: `backend/app/agent/__init__.py`
- Create: `backend/app/agent/worker.py`

**Interfaces:**
- Consumes: `settings.LIVEKIT_URL/API_KEY/API_SECRET`, `trigger_egress()` from livekit client, `process_interview_audio.delay()` from Celery
- Produces: Agent process that joins every room, triggers egress on room end, enqueues Celery task

- [ ] **Step 1: Create `__init__.py`**

Empty file.

- [ ] **Step 2: Create `worker.py`**

```python
import asyncio
import logging
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents import JobProcess
from app.core.config import settings

logger = logging.getLogger(__name__)


async def entrypoint(ctx: JobContext):
    """Called when agent is assigned to a room."""
    logger.info(f"Agent joining room: {ctx.room.name}")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Update agentStatus in DB to "joined"
    _update_agent_status(ctx.room.name, "joined")

    # Wait for room to end
    await ctx.room.wait_for_disconnect()

    logger.info(f"Room ended: {ctx.room.name}. Triggering egress.")
    await _on_room_end(ctx.room.name)


async def _on_room_end(room_name: str):
    from app.features.livekit.client import trigger_egress

    audio_key = f"interviews/{room_name}.ogg"
    try:
        await trigger_egress(room_name, audio_key)
        audio_url = f"r2://{settings.R2_BUCKET_NAME}/{audio_key}"

        # Find interview by room name and enqueue Celery task
        interview_id = _get_interview_id_by_room(room_name)
        if interview_id:
            from app.workers.tasks import process_interview_audio
            process_interview_audio.delay(interview_id, audio_url)

        _update_agent_status(room_name, "finished")
    except Exception as e:
        logger.error(f"Egress failed for room {room_name}: {e}")
        _update_agent_status(room_name, "failed")


def _get_interview_id_by_room(room_name: str) -> str | None:
    from app.core.database import SyncSessionLocal
    from app.shared.models import Interview
    from sqlalchemy import select

    with SyncSessionLocal() as db:
        result = db.execute(select(Interview).where(Interview.livekitRoomName == room_name))
        interview = result.scalar_one_or_none()
        return interview.id if interview else None


def _update_agent_status(room_name: str, status: str):
    from app.core.database import SyncSessionLocal
    from app.shared.models import Interview
    from sqlalchemy import select

    with SyncSessionLocal() as db:
        result = db.execute(select(Interview).where(Interview.livekitRoomName == room_name))
        interview = result.scalar_one_or_none()
        if interview:
            interview.agentStatus = status
            db.commit()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
            ws_url=settings.LIVEKIT_URL,
        )
    )
```

- [ ] **Step 3: Verify agent starts without errors**

```bash
cd backend
python -m app.agent.worker
```

Expected: `Starting worker...` — agent connects to LiveKit Cloud and waits for rooms.

- [ ] **Step 4: End-to-end smoke test**

1. Start: `uvicorn app.main:app --reload` (terminal 1)
2. Start: `python -m app.agent.worker` (terminal 2)
3. Create an interview via API — note the `livekitRoomName`
4. Open the LiveKit Cloud dashboard — verify room exists and agent joins when someone connects
5. Disconnect all participants — verify agent triggers egress
6. Check `Interview.agentStatus` is `finished` in DB

- [ ] **Step 5: Commit**

```bash
git add backend/app/agent/
git commit -m "feat: add LiveKit agent worker"
```

---

## Task 7: Frontend — Install LiveKit + Video Call Page

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/app/interview/[roomId]/page.tsx`
- Create: `frontend/src/app/interview/[roomId]/video-call.tsx`

**Interfaces:**
- Consumes: `?token=` query param OR fetches from `GET /api/applications/{appId}/interviews/{id}/token`
- Produces: Full-page video call using LiveKit React components

- [ ] **Step 1: Install LiveKit packages**

```bash
cd frontend
npm install @livekit/components-react livekit-client
```

- [ ] **Step 2: Create `video-call.tsx` (client component)**

```typescript
"use client";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useRouter } from "next/navigation";

interface Props {
  token: string;
  serverUrl: string;
  interviewTitle: string;
}

export function VideoCall({ token, serverUrl, interviewTitle }: Props) {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-medium text-white">{interviewTitle}</span>
      </div>
      <div className="flex-1 min-h-0">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={() => router.push("/candidate/dashboard")}
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `page.tsx` (server component)**

```typescript
import { notFound } from "next/navigation";
import { VideoCall } from "./video-call";

interface Props {
  searchParams: { token?: string; title?: string };
}

export default function InterviewPage({ searchParams }: Props) {
  const { token, title } = searchParams;

  if (!token) {
    notFound();
  }

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

  return (
    <VideoCall
      token={token}
      serverUrl={serverUrl}
      interviewTitle={title ?? "Interview"}
    />
  );
}
```

- [ ] **Step 4: Add `NEXT_PUBLIC_LIVEKIT_URL` to `frontend/.env.local`**

```
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

- [ ] **Step 5: Add route to middleware public paths**

In `frontend/src/middleware.ts`, add `/interview` to `RECRUITER_PUBLIC_PATHS` (candidate magic link needs no auth):

```typescript
const RECRUITER_PUBLIC_PATHS = ["/login", "/signup", "/invite", "/auth/signout", "/interview"];
```

- [ ] **Step 6: Test the video call page**

1. Create an interview via the API — get back `recruiterJoinUrl`
2. Open `recruiterJoinUrl` in browser — video call should load and connect
3. Open `candidateJoinUrl` in a second browser tab — both participants see each other
4. Check LiveKit Cloud dashboard — both participants shown in room

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/interview/ frontend/package.json frontend/package-lock.json
git commit -m "feat: add in-app LiveKit video call page"
```

---

## Task 8: Recruiter Dashboard — Interview Join Button

**Files:**
- Modify: `frontend/src/app/candidates/[id]/applications/[applicationId]/page.tsx`

**Interfaces:**
- Consumes: `interview.livekitRoomName`, `interview.candidateJoinUrl`, `GET /api/applications/{id}/interviews/{interviewId}/token`
- Produces: "Join Interview" button for recruiter, copyable candidate join link

- [ ] **Step 1: Update the interview section in the application detail page**

Find where `meetingUrl` is currently rendered. Replace with:

```typescript
{interview.livekitRoomName && (
  <div className="space-y-3">
    <JoinInterviewButton
      applicationId={application.id}
      interviewId={interview.id}
      title={interview.title}
    />
    {interview.candidateJoinUrl && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Candidate link:</span>
        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
          {interview.candidateJoinUrl}
        </code>
        <button
          onClick={() => navigator.clipboard.writeText(interview.candidateJoinUrl!)}
          className="text-xs text-primary hover:underline"
        >
          Copy
        </button>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Create `JoinInterviewButton` client component**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface Props {
  applicationId: string;
  interviewId: string;
  title: string;
}

export function JoinInterviewButton({ applicationId, interviewId, title }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleJoin() {
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; roomName: string }>(
        `/api/applications/${applicationId}/interviews/${interviewId}/token`
      );
      router.push(`/interview/join?token=${data.token}&title=${encodeURIComponent(title)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleJoin} disabled={loading} className="gap-2">
      <Video className="h-4 w-4" />
      {loading ? "Connecting…" : "Join Interview"}
    </Button>
  );
}
```

- [ ] **Step 3: Test recruiter join flow**

1. Create interview → see "Join Interview" button and copyable candidate link
2. Click "Join Interview" → token fetched → redirected to `/interview/join?token=...`
3. Video call connects

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/candidates/ frontend/src/components/
git commit -m "feat: add join interview button and candidate link copy to dashboard"
```

---

## Task 9: Candidate Portal — Interview Join

**Files:**
- Modify: `frontend/src/app/(candidate)/candidate/dashboard/page.tsx`

**Interfaces:**
- Consumes: `interview.candidateJoinUrl` from `GET /api/candidate/me`
- Produces: "Join Interview" button in candidate dashboard

- [ ] **Step 1: Add interview section to candidate dashboard**

In the candidate dashboard, where interviews are listed, add a "Join" button that navigates to `interview.candidateJoinUrl` directly (the URL already contains the token):

```typescript
{interview.candidateJoinUrl && (
  <a
    href={interview.candidateJoinUrl}
    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
  >
    <Video className="h-4 w-4" />
    Join Interview
  </a>
)}
```

- [ ] **Step 2: Verify both join paths work**

- Candidate clicks "Join Interview" in dashboard → video call loads
- Candidate uses magic link URL → video call loads (no login required)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\(candidate\)/
git commit -m "feat: add interview join button to candidate dashboard"
```

---

## Verification Checklist

- [ ] LiveKit Cloud dashboard shows room created when interview is created via API
- [ ] Agent process starts with `python -m app.agent.worker` — no import errors
- [ ] Agent joins room when first participant connects — visible in LiveKit dashboard
- [ ] Both recruiter and candidate can join the same room and see/hear each other
- [ ] Room ends → Egress fires → `.ogg` file appears in R2 bucket
- [ ] `Interview.agentStatus` transitions: `pending` → `joined` → `finished`
- [ ] `Interview.audioUrl` is populated after room ends
- [ ] `process_interview_audio` Celery task is enqueued with correct `interview_id` and `audio_url`
- [ ] Recruiter "Join Interview" button fetches fresh token and redirects to video call
- [ ] Candidate magic link opens video call without requiring login
- [ ] Candidate dashboard "Join" button navigates to video call
