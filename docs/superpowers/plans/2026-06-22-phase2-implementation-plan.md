# Phase 2 Implementation Plan — Live Transcription + Audio Analysis

**Branch:** `interview-ai-analysis`  
**Status:** Ready to implement

---

## What we're building

Two things running in parallel during every interview call:

1. **Live transcription** — agent streams candidate + recruiter audio to Deepgram, segments land in DB in real-time, recruiter's browser polls and sees the transcript live, can click "Suggest follow-up" to get LLM-generated questions based on full conversation so far

2. **Audio recording** — agent writes raw PCM frames to a temp `.wav` file on disk, uploads to R2 on room close, Celery runs Gemini audio analysis post-call and writes `InterviewAnalysis` scores

---

## Dependencies to install

```bash
pip install deepgram-sdk==3.10.1
```

Add to `backend/pyproject.toml`:
```toml
"deepgram-sdk>=3.10,<4.0",
```

`boto3`, `google-generativeai` already installed and in pyproject.toml. No other new packages.

---

## Task 1 — Config

**File:** `backend/app/core/config.py`

Add one field to `Settings`:
```python
DEEPGRAM_API_KEY: str = ""
```

Add to `backend/.env` and `backend/.env.example`:
```
DEEPGRAM_API_KEY=
```

---

## Task 2 — DB: `LiveTranscriptSegment` model

**File:** `backend/app/shared/models.py`

Add after `InterviewAnalysis`:

```python
class LiveTranscriptSegment(Base):
    __tablename__ = "LiveTranscriptSegment"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    interviewId: Mapped[str] = mapped_column(String, ForeignKey("Interview.id"), nullable=False)
    speaker: Mapped[str] = mapped_column(String, nullable=False)   # "candidate" | "recruiter"
    text: Mapped[str] = mapped_column(Text, nullable=False)
    timestampMs: Mapped[int] = mapped_column(Integer, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=_now)

    interview: Mapped["Interview"] = relationship(back_populates="segments")
```

Add relationship on `Interview`:
```python
segments: Mapped[list["LiveTranscriptSegment"]] = relationship(
    back_populates="interview", cascade="all, delete-orphan", order_by="LiveTranscriptSegment.timestampMs"
)
```

**Migration:**
```bash
cd backend
alembic revision --autogenerate -m "add_live_transcript_segment"
alembic upgrade head
```

---

## Task 3 — Agent rewrite

**File:** `backend/app/agent/worker.py`

Full rewrite. The entrypoint now:

1. Connects to room with `AutoSubscribe.AUDIO_ONLY`
2. Listens for `track_subscribed` events
3. For each audio track, determines speaker label from `participant.identity` (contains `"candidate"` or `"recruiter"`)
4. Starts two async tasks per track: `_transcribe_track()` and `_record_track()`
5. Registers `on_shutdown` callback that flushes everything and uploads

```python
import asyncio
import logging
import os
import tempfile
import wave

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# In-memory state per room: {room_name: {"wav_files": [...], "deepgram_conns": [...], "start_time": float}}
_room_state: dict = {}


async def entrypoint(ctx: "JobContext"):
    from livekit.agents import AutoSubscribe, JobContext  # noqa: F401
    import time

    room_name = ctx.room.name
    logger.info("Agent joining room: %s", room_name)

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(room_name, "joined")

    _room_state[room_name] = {
        "tasks": [],
        "wav_files": {},      # speaker -> (file_path, wave.Wave_write)
        "dg_conns": {},       # speaker -> Deepgram connection
        "start_ms": int(time.time() * 1000),
        "interview_id": _get_interview_id_by_room(room_name),
    }

    @ctx.room.on("track_subscribed")
    def on_track(track, publication, participant):
        identity = participant.identity or ""
        if "candidate" in identity:
            speaker = "candidate"
        elif "recruiter" in identity:
            speaker = "recruiter"
        else:
            return  # ignore agent or unknown participants

        state = _room_state.get(room_name)
        if not state:
            return

        # Start temp wav file for this speaker
        tmp = tempfile.NamedTemporaryFile(
            suffix=f"_{speaker}.wav", delete=False, dir=tempfile.gettempdir()
        )
        wf = wave.open(tmp.name, "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)       # int16
        wf.setframerate(16000)
        state["wav_files"][speaker] = (tmp.name, wf)
        tmp.close()

        t1 = asyncio.create_task(_transcribe_track(track, speaker, state))
        t2 = asyncio.create_task(_record_track(track, speaker, state))
        state["tasks"].extend([t1, t2])

    async def on_shutdown():
        await _flush_and_upload(room_name)

    ctx.add_shutdown_callback(on_shutdown)
```

**`_transcribe_track(track, speaker, state)`**

```python
async def _transcribe_track(track, speaker: str, state: dict):
    from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents
    from livekit.rtc import AudioStream
    import httpx, time

    settings = get_settings()
    dg = DeepgramClient(settings.DEEPGRAM_API_KEY)
    conn = dg.listen.asyncwebsocket.v("1")

    transcript_buffer = []

    async def on_transcript(self_ref, result, **kwargs):
        try:
            sentence = result.channel.alternatives[0].transcript
            is_final = result.is_final
            if is_final and sentence.strip():
                elapsed_ms = int(time.time() * 1000) - state["start_ms"]
                transcript_buffer.append({
                    "speaker": speaker,
                    "text": sentence,
                    "timestampMs": elapsed_ms,
                })
                interview_id = state.get("interview_id")
                if interview_id:
                    try:
                        async with httpx.AsyncClient() as client:
                            await client.post(
                                f"http://localhost:8000/internal/interviews/{interview_id}/segment",
                                json={"speaker": speaker, "text": sentence, "timestampMs": elapsed_ms},
                                timeout=5.0,
                            )
                    except Exception:
                        logger.warning("Failed to POST segment for %s", interview_id)
        except Exception:
            logger.exception("Transcript callback error")

    conn.on(LiveTranscriptionEvents.Transcript, on_transcript)

    opts = LiveOptions(
        model="nova-2",
        language="en-US",
        smart_format=True,
        encoding="linear16",
        sample_rate=16000,
        channels=1,
    )
    await conn.start(opts)
    state["dg_conns"][speaker] = conn

    audio_stream = AudioStream(track, sample_rate=16000, num_channels=1)
    async for event in audio_stream:
        await conn.send(bytes(event.frame.data))

    await conn.finish()
```

**`_record_track(track, speaker, state)`**

```python
async def _record_track(track, speaker: str, state: dict):
    from livekit.rtc import AudioStream

    audio_stream = AudioStream(track, sample_rate=16000, num_channels=1)
    async for event in audio_stream:
        wav_entry = state["wav_files"].get(speaker)
        if wav_entry:
            _, wf = wav_entry
            try:
                wf.writeframes(bytes(event.frame.data))
            except Exception:
                logger.warning("WAV write error for speaker %s", speaker)
```

**`_flush_and_upload(room_name)`**

```python
async def _flush_and_upload(room_name: str):
    import boto3

    state = _room_state.pop(room_name, None)
    if not state:
        return

    interview_id = state.get("interview_id")
    settings = get_settings()

    # Cancel any running tasks
    for task in state.get("tasks", []):
        if not task.done():
            task.cancel()

    # Close all WAV files and upload to R2
    audio_urls = {}
    for speaker, (file_path, wf) in state.get("wav_files", {}).items():
        try:
            wf.close()
            key = f"interviews/{interview_id}/{speaker}.wav"
            s3 = boto3.client(
                "s3",
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto",
            )
            s3.upload_file(file_path, settings.R2_BUCKET_NAME, key)
            audio_urls[speaker] = f"r2://{settings.R2_BUCKET_NAME}/{key}"
            os.unlink(file_path)
            logger.info("Uploaded %s audio to R2: %s", speaker, key)
        except Exception:
            logger.exception("Failed to upload %s audio", speaker)

    # Assemble transcript from DB segments
    full_transcript = _assemble_transcript(interview_id)

    # Write transcript + audioUrl + status to DB
    _finalize_interview(
        interview_id=interview_id,
        transcript=full_transcript,
        audio_url=audio_urls.get("candidate", ""),   # primary audio is candidate
    )

    # Enqueue Celery post-processing
    if interview_id and audio_urls.get("candidate"):
        from app.workers.tasks import process_interview_audio
        process_interview_audio.delay(interview_id, audio_urls["candidate"])

    _update_agent_status(room_name, "finished")
```

**Helper functions** (sync DB calls — same pattern as existing `_update_agent_status`):

- `_get_interview_id_by_room(room_name)` — already exists, keep it
- `_update_agent_status(room_name, status)` — already exists, keep it
- `_assemble_transcript(interview_id)` — queries `LiveTranscriptSegment` ordered by `timestampMs`, formats as `"Recruiter: ...\nCandidate: ...\n"`
- `_finalize_interview(interview_id, transcript, audio_url)` — sets `Interview.transcript`, `Interview.audioUrl`, `Interview.status = COMPLETED`

---

## Task 4 — Internal segment endpoint

**File:** `backend/app/features/interviews/router.py`

Add one internal endpoint (no auth — called by the agent from localhost):

```python
@router.post("/{interview_id}/segment", include_in_schema=False)
async def internal_segment(
    application_id: str,
    interview_id: str,
    body: SegmentRequest,
    db: DB,
    request: Request,
):
    # Only accept from localhost
    client_host = request.client.host if request.client else ""
    if client_host not in ("127.0.0.1", "::1", "localhost"):
        raise HTTPException(status_code=403)
    await service.write_segment(interview_id, body.speaker, body.text, body.timestampMs, db)
```

**File:** `backend/app/features/interviews/schemas.py`

Add:
```python
class SegmentRequest(BaseModel):
    speaker: str      # "candidate" | "recruiter"
    text: str
    timestampMs: int
```

**File:** `backend/app/features/interviews/service.py`

Add:
```python
async def write_segment(
    interview_id: str, speaker: str, text: str, timestamp_ms: int, db: AsyncSession
) -> None:
    from app.shared.models import LiveTranscriptSegment
    segment = LiveTranscriptSegment(
        interviewId=interview_id,
        speaker=speaker,
        text=text,
        timestampMs=timestamp_ms,
    )
    db.add(segment)
    await db.flush()
```

---

## Task 5 — Transcript poll endpoint

**File:** `backend/app/features/interviews/router.py`

Add (recruiter auth):
```python
@router.get("/{interview_id}/transcript-live")
async def transcript_live(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.get_live_transcript(interview_id, application_id, auth.organization_id, db)
```

**File:** `backend/app/features/interviews/service.py`

Add:
```python
async def get_live_transcript(
    interview_id: str, app_id: str, org_id: str, db: AsyncSession
) -> dict:
    from app.shared.models import LiveTranscriptSegment
    from sqlalchemy import select

    await _load_interview(interview_id, app_id, org_id, db)  # auth check
    result = await db.execute(
        select(LiveTranscriptSegment)
        .where(LiveTranscriptSegment.interviewId == interview_id)
        .order_by(LiveTranscriptSegment.timestampMs)
    )
    segments = result.scalars().all()
    return {
        "segments": [
            {"speaker": s.speaker, "text": s.text, "timestampMs": s.timestampMs}
            for s in segments
        ]
    }
```

---

## Task 6 — Suggest endpoint

**File:** `backend/app/features/interviews/router.py`

Add:
```python
@router.post("/{interview_id}/suggest")
async def suggest(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.suggest_followup(interview_id, application_id, auth.organization_id, db)
```

**File:** `backend/app/features/interviews/service.py`

Add:
```python
async def suggest_followup(
    interview_id: str, app_id: str, org_id: str, db: AsyncSession
) -> dict:
    from app.shared.models import LiveTranscriptSegment, JobApplication, Job
    from app.features.intelligence.engines import run_live_assist
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    await _load_interview(interview_id, app_id, org_id, db)

    # Load segments
    seg_result = await db.execute(
        select(LiveTranscriptSegment)
        .where(LiveTranscriptSegment.interviewId == interview_id)
        .order_by(LiveTranscriptSegment.timestampMs)
    )
    segments = seg_result.scalars().all()

    if not segments:
        return {"followUpQuestions": []}

    # Load job context
    app_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.id == app_id)
        .options(selectinload(JobApplication.job))
    )
    app = app_result.scalar_one_or_none()
    job_context = ""
    if app and app.job:
        job_context = f"{app.job.title}\n{app.job.requirements or app.job.description or ''}"

    conversation = [
        {"speaker": s.speaker, "text": s.text, "ts": s.timestampMs}
        for s in segments
    ]

    result = await run_live_assist(job_context, conversation)
    return {"followUpQuestions": result.followUpQuestions}
```

---

## Task 7 — Rewrite `run_live_assist`

**File:** `backend/app/features/intelligence/engines.py`

Replace the existing `run_live_assist` function:

```python
_LIVE_ASSIST_FALLBACK = {"followUpQuestions": []}

async def run_live_assist(
    job_context: str,
    conversation: list[dict],   # [{"speaker": "recruiter"|"candidate", "text": "...", "ts": 1200}]
) -> LiveAssistResult:
    formatted = "\n".join(
        f"{seg['speaker'].capitalize()}: {seg['text']}"
        for seg in conversation
    )
    system = (
        "You are a live interview assistant helping a recruiter conduct a job interview. "
        "You will be given the full conversation so far and the job context. "
        "Suggest exactly 3 specific follow-up questions the recruiter should ask next. "
        "Rules: do not repeat topics already covered; prioritise vague answers that need probing; "
        "surface gaps from the job context that haven't been addressed yet; "
        "make questions concrete and role-specific, not generic. "
        "Return JSON with one key: followUpQuestions (string[], exactly 3 items)."
    )
    user = f"JOB CONTEXT:\n{job_context}\n\nCONVERSATION SO FAR:\n{formatted}"
    raw = await chat_json(system, user, _LIVE_ASSIST_FALLBACK)
    return LiveAssistResult(followUpQuestions=raw.get("followUpQuestions", []))
```

**File:** `backend/app/features/intelligence/types.py`

Replace `LiveAssistResult`:
```python
@dataclass
class LiveAssistResult:
    followUpQuestions: list[str] = field(default_factory=list)
```

---

## Task 8 — Delete old live assist dead code

**File:** `backend/app/features/applications/schemas.py`
- Remove `LiveAssistRequest`

**File:** `backend/app/features/applications/router.py`
- Remove `POST /{application_id}/live-assist` endpoint
- Remove `LiveAssistRequest` import

**File:** `backend/app/features/applications/service.py`
- Remove `run_live_assist` function (lines 177–188)

---

## Task 9 — Fill in `process_interview_audio` Celery task

**File:** `backend/app/workers/tasks.py`

Replace the stub body with full implementation:

```python
@celery.task(name="process_interview_audio", bind=True, max_retries=2)
def process_interview_audio(self, interview_id: str, audio_url: str) -> None:
    import asyncio
    import json
    import tempfile
    import os
    import boto3
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    try:
        Session = get_sync_session_factory()
        with Session() as db:
            interview = db.get(Interview, interview_id)
            if not interview:
                return

            app_result = db.execute(
                select(JobApplication)
                .where(JobApplication.id == interview.applicationId)
                .options(selectinload(JobApplication.candidate), selectinload(JobApplication.talent_profile))
            )
            app = app_result.scalar_one_or_none()
            transcript = interview.transcript or ""
            resume_text = (app.candidate.resumeText if app and app.candidate else "") or ""

            # Download audio from R2
            settings = get_settings()
            key = audio_url.replace(f"r2://{settings.R2_BUCKET_NAME}/", "")
            s3 = boto3.client(
                "s3",
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto",
            )
            tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            s3.download_file(settings.R2_BUCKET_NAME, key, tmp.name)
            tmp.close()
            audio_path = tmp.name

            try:
                # Run Gemini audio analysis
                audio_metrics = _run_gemini_audio(audio_path, settings.GOOGLE_API_KEY)
            finally:
                os.unlink(audio_path)

            # Run text intelligence on transcript
            from app.features.intelligence.engines import run_interview_intelligence
            text_result = asyncio.run(run_interview_intelligence(transcript, resume_text))

            # Upsert InterviewAnalysis
            from app.shared.models import InterviewAnalysis
            analysis = db.execute(
                select(InterviewAnalysis).where(InterviewAnalysis.interviewId == interview_id)
            ).scalar_one_or_none()
            if not analysis:
                analysis = InterviewAnalysis(interviewId=interview_id)
                db.add(analysis)

            analysis.hesitationScore = text_result.hesitationScore
            analysis.confidenceScore = text_result.confidenceScore
            analysis.clarityScore = text_result.clarityScore
            analysis.consistencyScore = text_result.consistencyScore
            analysis.engagementScore = text_result.engagementScore
            analysis.cognitiveSignals = text_result.cognitiveSignals
            analysis.behavioralMetrics = {**(text_result.behavioralMetrics or {}), "audioMetrics": audio_metrics}
            analysis.riskFlags = text_result.riskFlags
            analysis.rawAnalysis = text_result.rawAnalysis

            interview.status = InterviewStatus.ANALYZED

            # Cross-signal + decision if talent profile exists
            if app and app.talent_profile:
                from app.features.intelligence.engines import run_cross_signal, run_decision_intelligence
                from app.features.intelligence.types import TalentResult
                from app.shared.models import Decision
                tp = app.talent_profile
                talent = TalentResult(
                    skills=tp.skills or [], strengths=tp.strengths or [],
                    gaps=tp.gaps or [], hiddenSignals=tp.hiddenSignals or [],
                    explanation=tp.explanation or "",
                )
                cross = asyncio.run(run_cross_signal(talent, text_result))
                decision_result = asyncio.run(run_decision_intelligence(talent, text_result))

                dec = db.execute(select(Decision).where(Decision.applicationId == app.id)).scalar_one_or_none()
                if not dec:
                    dec = Decision(applicationId=app.id)
                    db.add(dec)
                dec.hireConfidence = decision_result.hireConfidence
                dec.recommendation = decision_result.recommendation
                dec.riskFactors = decision_result.riskFactors
                dec.explanation = decision_result.explanation
                dec.signalBreakdown = {**decision_result.signalBreakdown, "crossSignalConsistency": cross.consistencyScore}

            if app:
                app.stage = PipelineStage.INTERVIEWED

            db.commit()

        # Delete from R2 after analysis (privacy)
        s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


def _run_gemini_audio(audio_path: str, api_key: str) -> dict:
    """Upload WAV to Gemini Files API, run structured audio analysis, return metrics dict."""
    import google.generativeai as genai
    import json

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")

    audio_file = genai.upload_file(audio_path, mime_type="audio/wav")

    prompt = (
        "Analyze this job interview audio. Return ONLY valid JSON with these keys:\n"
        "paceWpm (number), pauseFrequency (pauses per minute > 500ms), "
        "fillerDensity (filler words per 100 words), energyLevel (0-1), "
        "dominantTone (string), emotionalVariance (0-1)"
    )
    response = model.generate_content([prompt, audio_file])
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(raw)
    except Exception:
        return {}
```

---

## Task 10 — Frontend: redesign `/interview/join`

**File:** `frontend/src/app/interview/join/video-call.tsx`

Split layout — video left, panel right:

```tsx
export function VideoCall({ token, serverUrl, interviewTitle, returnTo, interviewId, applicationId }: Props) {
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Video — 65% width */}
      <div className="flex flex-col" style={{ width: "65%" }}>
        <header className="...">...</header>
        <LiveKitRoom token={token} serverUrl={serverUrl} ...>
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>

      {/* Live panel — 35% width */}
      <LiveAssistPanel interviewId={interviewId} applicationId={applicationId} />
    </div>
  );
}
```

**New file:** `frontend/src/app/interview/join/live-assist-panel.tsx`

Client component with:
- `useEffect` that polls `GET /api/applications/{appId}/interviews/{id}/transcript-live` every 3 seconds while call is active
- Renders segments as a scrolling transcript feed, colour-coded by speaker
- "Suggest follow-up" button → `POST /api/applications/{appId}/interviews/{id}/suggest` → renders returned `followUpQuestions` list
- Button shows loading spinner while waiting, replaces previous suggestions on each click

**File:** `frontend/src/app/interview/join/page.tsx`

Pass `interviewId` and `applicationId` from `searchParams` to `VideoCall`. Update `interview-workflow-panel.tsx` to append these to the join URL:
```typescript
url.searchParams.set("interviewId", activeId);
url.searchParams.set("applicationId", applicationId);
```

---

## Files changed summary

| File | Change |
|---|---|
| `backend/app/core/config.py` | Add `DEEPGRAM_API_KEY` |
| `backend/app/shared/models.py` | Add `LiveTranscriptSegment`, add `segments` relationship to `Interview` |
| `backend/alembic/versions/` | New migration |
| `backend/app/agent/worker.py` | Full rewrite — Deepgram tasks + WAV recording + R2 upload |
| `backend/app/features/interviews/router.py` | Add `/segment` (internal), `/transcript-live`, `/suggest` |
| `backend/app/features/interviews/service.py` | Add `write_segment`, `get_live_transcript`, `suggest_followup` |
| `backend/app/features/interviews/schemas.py` | Add `SegmentRequest` |
| `backend/app/features/intelligence/engines.py` | Rewrite `run_live_assist` |
| `backend/app/features/intelligence/types.py` | Trim `LiveAssistResult` to `followUpQuestions` only |
| `backend/app/features/applications/schemas.py` | Remove `LiveAssistRequest` |
| `backend/app/features/applications/router.py` | Remove `/live-assist` endpoint |
| `backend/app/features/applications/service.py` | Remove old `run_live_assist` |
| `backend/app/workers/tasks.py` | Fill in `process_interview_audio` + add `_run_gemini_audio` |
| `backend/pyproject.toml` | Add `deepgram-sdk` |
| `frontend/src/app/interview/join/video-call.tsx` | Split layout |
| `frontend/src/app/interview/join/live-assist-panel.tsx` | New — transcript feed + suggest button |
| `frontend/src/app/interview/join/page.tsx` | Pass `interviewId`, `applicationId` from searchParams |
| `frontend/src/components/features/candidates/interview-workflow-panel.tsx` | Append `interviewId` + `applicationId` to join URL |

---

## Implementation order

1. Config + DB model + migration (Tasks 1–2) — foundation everything else touches
2. Intelligence engine rewrite + dead code cleanup (Tasks 7–8) — no dependencies, safe to do early
3. Backend endpoints (Tasks 4–6) — depend on DB model
4. Agent rewrite (Task 3) — depends on endpoints being live to POST segments
5. Celery task (Task 9) — independent, can go in parallel with agent
6. Frontend (Task 10) — depends on endpoints 5 + 6 being live

## Test sequence

1. Start agent worker, join a room, speak for 30s → check `LiveTranscriptSegment` rows appear in DB
2. Hit `/suggest` mid-call → get 3 follow-up questions back
3. End call → check `Interview.transcript` assembled, `Interview.audioUrl` set, WAV file in R2
4. Celery picks up `process_interview_audio` → check `InterviewAnalysis` scores written to DB
5. Open `/interview/join` → see split layout, transcript updating every 3s, suggest button working
