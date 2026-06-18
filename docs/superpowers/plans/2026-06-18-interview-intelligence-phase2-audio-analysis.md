# Interview Intelligence — Phase 2: Audio Analysis Pipeline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire AssemblyAI real-time transcription into the LiveKit Agent (so transcript is built word-by-word during the call), then add a post-interview Celery pipeline that runs Gemini audio analysis on the exported `.ogg`, aggregates the results, and writes the four interview scores (hesitation, confidence, clarity, consistency) to `InterviewAnalysis`.

**Architecture:** Two sub-pipelines running from Phase 1's foundation. (1) **Live:** LiveKit Agent streams candidate audio to AssemblyAI Universal Streaming WebSocket — partial transcripts accumulate in Redis, final transcript written to `Interview.transcript` on room end. (2) **Post-interview:** Celery `process_interview_audio` task (stubbed in Phase 1) now runs: download `.ogg` from R2 → Gemini 2.5 Flash audio analysis → compute scores → upsert `InterviewAnalysis` → update `JobApplication.stage = INTERVIEWED`. The existing `analyze_interview` endpoint (text-only LLM analysis) remains but is now superseded by the Celery pipeline for LiveKit interviews.

**Tech Stack:** `assemblyai` Python SDK, `livekit-agents[assemblyai]` plugin, `google-generativeai` (Gemini 2.5 Flash), `boto3` (R2 download), existing Celery + Redis, existing `InterviewAnalysis` model.

## Global Constraints

- Branch: `interview-ai-analysis` (branched from `fastapi-migration` after Phase 1 merges)
- Phase 1 must be merged before starting Phase 2
- AssemblyAI API key required — sign up at assemblyai.com, free tier available
- Gemini API key required — already in settings as `GOOGLE_API_KEY` or similar (check `config.py`)
- Audio privacy: `.ogg` file deleted from R2 within 10 minutes of analysis completion
- Transcript stored permanently in `Interview.transcript`
- No changes to the existing text-only `analyze_interview` endpoint — it stays as a fallback

---

## Files to Create

| File | Purpose |
|------|---------|
| `backend/app/agent/transcriber.py` | AssemblyAI streaming transcription session — runs inside the Agent |
| `backend/app/features/intelligence/audio_analysis.py` | Gemini audio analysis — takes R2 audio URL, returns per-segment tone/energy/pace |
| `backend/app/features/intelligence/score_computation.py` | Pure functions: compute hesitation/confidence/clarity/consistency from transcript + audio analysis |

## Files to Modify

| File | Change |
|------|--------|
| `backend/app/agent/worker.py` | Import and start `TranscriptionSession` alongside agent; write final transcript to DB on room end |
| `backend/app/workers/tasks.py` | Fill in `process_interview_audio`: download audio, run Gemini, compute scores, write `InterviewAnalysis` |
| `backend/app/core/config.py` | Add `ASSEMBLYAI_API_KEY` |
| `backend/pyproject.toml` | Add `assemblyai`, `google-generativeai` |
| `backend/.env.example` | Add `ASSEMBLYAI_API_KEY` |

---

## Task 1: AssemblyAI Config + Dependency

**Files:**
- Modify: `backend/app/core/config.py`
- Modify: `backend/pyproject.toml`
- Modify: `backend/.env.example`

- [ ] **Step 1: Add `ASSEMBLYAI_API_KEY` to `Settings`**

```python
ASSEMBLYAI_API_KEY: str = ""
```

- [ ] **Step 2: Install AssemblyAI SDK and LiveKit AssemblyAI plugin**

```bash
pip install assemblyai "livekit-agents[assemblyai]"
```

Add to `pyproject.toml`:
```toml
"assemblyai>=0.26",
"livekit-agents[assemblyai]>=0.8",
```

- [ ] **Step 3: Update `.env.example`**

```
ASSEMBLYAI_API_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/core/config.py backend/pyproject.toml backend/.env.example
git commit -m "feat: add AssemblyAI config and dependency"
```

---

## Task 2: Live Transcription Session in the Agent

**Files:**
- Create: `backend/app/agent/transcriber.py`
- Modify: `backend/app/agent/worker.py`

**Interfaces:**
- Consumes: `settings.ASSEMBLYAI_API_KEY`, candidate audio track from LiveKit room
- Produces:
  - Partial transcripts accumulated in-memory during session
  - `TranscriptionSession.get_full_transcript() -> str` — returns complete transcript on session end
  - Final transcript written to `Interview.transcript` in DB

- [ ] **Step 1: Create `transcriber.py`**

```python
import asyncio
import logging
from livekit.agents import stt
from livekit.plugins import assemblyai
from app.core.config import settings

logger = logging.getLogger(__name__)


class TranscriptionSession:
    def __init__(self):
        self._segments: list[str] = []
        self._stt: stt.STT | None = None
        self._stream: stt.SpeechStream | None = None

    async def start(self, audio_source):
        self._stt = assemblyai.STT(api_key=settings.ASSEMBLYAI_API_KEY)
        self._stream = self._stt.stream()
        asyncio.create_task(self._process_stream())
        asyncio.create_task(self._forward_audio(audio_source))

    async def _forward_audio(self, audio_source):
        async for frame in audio_source:
            if self._stream:
                self._stream.push_frame(frame)

    async def _process_stream(self):
        if not self._stream:
            return
        async for event in self._stream:
            if isinstance(event, stt.SpeechEvent) and event.type == stt.SpeechEventType.FINAL_TRANSCRIPT:
                text = event.alternatives[0].text if event.alternatives else ""
                if text.strip():
                    self._segments.append(text)
                    logger.debug(f"Transcript segment: {text[:80]}")

    async def stop(self):
        if self._stream:
            await self._stream.aclose()

    def get_full_transcript(self) -> str:
        return " ".join(self._segments)
```

- [ ] **Step 2: Update `worker.py` to use `TranscriptionSession`**

Replace the `entrypoint` function:

```python
async def entrypoint(ctx: JobContext):
    logger.info(f"Agent joining room: {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(ctx.room.name, "joined")

    transcriber = TranscriptionSession()

    # Subscribe to candidate audio track
    @ctx.room.on("track_subscribed")
    def on_track(track, publication, participant):
        if track.kind == "audio" and "candidate" in participant.identity:
            asyncio.create_task(transcriber.start(track))

    await ctx.room.wait_for_disconnect()
    await transcriber.stop()

    full_transcript = transcriber.get_full_transcript()
    logger.info(f"Room ended. Transcript length: {len(full_transcript)} chars")

    _save_transcript(ctx.room.name, full_transcript)
    await _on_room_end(ctx.room.name)
```

- [ ] **Step 3: Add `_save_transcript()` to `worker.py`**

```python
def _save_transcript(room_name: str, transcript: str):
    from app.core.database import SyncSessionLocal
    from app.shared.models import Interview, InterviewStatus
    from sqlalchemy import select

    with SyncSessionLocal() as db:
        result = db.execute(select(Interview).where(Interview.livekitRoomName == room_name))
        interview = result.scalar_one_or_none()
        if interview:
            interview.transcript = transcript
            interview.status = InterviewStatus.COMPLETED
            db.commit()
```

- [ ] **Step 4: Smoke test transcription**

1. Start agent: `python -m app.agent.worker`
2. Create interview + join room
3. Speak for 30 seconds
4. End call
5. Check `Interview.transcript` in DB — should contain spoken words

- [ ] **Step 5: Commit**

```bash
git add backend/app/agent/
git commit -m "feat: add real-time AssemblyAI transcription to LiveKit agent"
```

---

## Task 3: Gemini Audio Analysis

**Files:**
- Create: `backend/app/features/intelligence/audio_analysis.py`

**Interfaces:**
- Consumes: R2 audio URL (string), `settings.GOOGLE_API_KEY` (or equivalent from `llm_runtime.py`)
- Produces:
  - `AudioAnalysisResult` dataclass
  - `run_audio_analysis(audio_url: str) -> AudioAnalysisResult`

- [ ] **Step 1: Add `AudioAnalysisResult` to `types.py`**

```python
@dataclass
class AudioAnalysisResult:
    toneProfile: dict[str, Any] = field(default_factory=dict)
    # e.g. {"dominant": "confident", "secondary": "nervous", "shifts": [...]}
    energyLevel: float | None = None          # 0–1 overall energy
    paceWpm: float | None = None              # words per minute
    pauseFrequency: float | None = None       # pauses per minute > 500ms
    fillerDensity: float | None = None        # filler words per 100 words
    emotionalVariance: float | None = None    # 0–1, low = flat/monotone
    perSegmentAnalysis: list[dict] = field(default_factory=list)
    # each: {"startMs": int, "endMs": int, "tone": str, "energy": float, "note": str}
    rawResponse: dict[str, Any] = field(default_factory=dict)
```

- [ ] **Step 2: Create `audio_analysis.py`**

```python
import boto3
import tempfile
import os
from app.core.config import settings
from app.features.intelligence.types import AudioAnalysisResult

AUDIO_ANALYSIS_PROMPT = """You are analyzing a job interview audio recording.

Analyze the candidate's speech patterns and provide:
1. Tone profile: dominant emotional tone, secondary tone, and any notable shifts
2. Overall energy level (0-1 scale, 0=flat/exhausted, 1=highly energetic)
3. Speaking pace in words per minute (estimate from audio duration and speech density)
4. Pause frequency: count of pauses longer than 500ms per minute of speaking
5. Filler word density: estimate of filler words (um, uh, like, you know, so) per 100 words
6. Emotional variance (0-1): how much the candidate's emotional tone varied
7. Per-segment analysis: break the audio into 3-5 segments, describe tone/energy per segment

Return ONLY valid JSON:
{
  "toneProfile": {
    "dominant": "<tone>",
    "secondary": "<tone>",
    "shifts": ["<description of notable shift>"]
  },
  "energyLevel": <0.0-1.0>,
  "paceWpm": <number>,
  "pauseFrequency": <number>,
  "fillerDensity": <number>,
  "emotionalVariance": <0.0-1.0>,
  "perSegmentAnalysis": [
    {"startMs": 0, "endMs": 60000, "tone": "<tone>", "energy": <0-1>, "note": "<observation>"}
  ]
}"""


async def run_audio_analysis(audio_url: str) -> AudioAnalysisResult:
    """Download audio from R2, send to Gemini Flash, return structured analysis."""
    import google.generativeai as genai
    import json

    # Download from R2
    audio_data = await _download_from_r2(audio_url)

    genai.configure(api_key=_get_gemini_key())
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Upload audio to Gemini Files API (required for audio input)
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(audio_data)
        tmp_path = tmp.name

    try:
        audio_file = genai.upload_file(tmp_path, mime_type="audio/ogg")
        response = model.generate_content([AUDIO_ANALYSIS_PROMPT, audio_file])
        raw = json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())
    finally:
        os.unlink(tmp_path)

    return AudioAnalysisResult(
        toneProfile=raw.get("toneProfile", {}),
        energyLevel=raw.get("energyLevel"),
        paceWpm=raw.get("paceWpm"),
        pauseFrequency=raw.get("pauseFrequency"),
        fillerDensity=raw.get("fillerDensity"),
        emotionalVariance=raw.get("emotionalVariance"),
        perSegmentAnalysis=raw.get("perSegmentAnalysis", []),
        rawResponse=raw,
    )


async def _download_from_r2(audio_url: str) -> bytes:
    """Download audio bytes from R2. audio_url format: r2://<bucket>/<key>"""
    key = audio_url.replace(f"r2://{settings.R2_BUCKET_NAME}/", "")
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )
    obj = s3.get_object(Bucket=settings.R2_BUCKET_NAME, Key=key)
    return obj["Body"].read()


async def delete_from_r2(audio_url: str) -> None:
    """Delete audio file from R2 after analysis (privacy requirement)."""
    key = audio_url.replace(f"r2://{settings.R2_BUCKET_NAME}/", "")
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )
    s3.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=key)


def _get_gemini_key() -> str:
    from app.features.intelligence.llm_runtime import settings as lk_settings
    # Use whatever key is configured for Google in llm_runtime
    return getattr(settings, "GOOGLE_API_KEY", "") or getattr(settings, "GEMINI_API_KEY", "")
```

- [ ] **Step 3: Install google-generativeai**

```bash
pip install google-generativeai
```

Add to `pyproject.toml`:
```toml
"google-generativeai>=0.8",
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/features/intelligence/audio_analysis.py backend/app/features/intelligence/types.py
git commit -m "feat: add Gemini audio analysis engine"
```

---

## Task 4: Score Computation

**Files:**
- Create: `backend/app/features/intelligence/score_computation.py`

**Interfaces:**
- Consumes: `AudioAnalysisResult`, `InterviewResult` (from existing text analysis), transcript string
- Produces:
  - `compute_hesitation_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float`
  - `compute_confidence_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float`
  - `compute_clarity_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float`
  - `compute_consistency_score(interview: InterviewResult) -> float`

Score formulas (from architecture doc):
- **Hesitation (0–100):** pause_frequency_normalized×45 + filler_density_normalized×35 + audio_tone_drops×20 (inverted — high pauses = low score)
- **Confidence (0–100):** gemini_audio_confidence×35 + interview_result_confidence×35 + language_markers×30
- **Clarity (0–100):** answer_structure×40 + question_relevance×20 + filler_penalty×20 + word_confidence×15 + pace_consistency×5
- **Consistency (0–100):** from existing `InterviewResult.consistencyScore` (text-only, unchanged)

- [ ] **Step 1: Create `score_computation.py`**

```python
from app.features.intelligence.types import AudioAnalysisResult, InterviewResult


def compute_hesitation_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float:
    """
    Lower pauses/fillers = higher score.
    pause_frequency: pauses/min, normalize against benchmark of 3/min = bad
    filler_density: fillers/100 words, normalize against benchmark of 10 = bad
    """
    pause_norm = max(0.0, 1.0 - (audio.pauseFrequency or 0) / 6.0)
    filler_norm = max(0.0, 1.0 - (audio.fillerDensity or 0) / 15.0)
    # tone_drops: infer from audio emotional variance (low variance may indicate coached anxiety)
    tone_drop = 1.0 - min(1.0, (audio.emotionalVariance or 0.5))
    score = (pause_norm * 45 + filler_norm * 35 + tone_drop * 20)
    return round(min(100.0, max(0.0, score)), 1)


def compute_confidence_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float:
    """
    Gemini audio dominant tone mapped to 0-1, existing interview confidence score, language markers.
    """
    tone_map = {
        "confident": 1.0, "assertive": 0.9, "neutral": 0.6,
        "uncertain": 0.3, "nervous": 0.2, "anxious": 0.15,
    }
    dominant_tone = (audio.toneProfile or {}).get("dominant", "neutral").lower()
    audio_confidence = tone_map.get(dominant_tone, 0.5)
    energy_boost = (audio.energyLevel or 0.5) * 0.2  # energy contributes to confidence feel

    text_confidence = (interview.confidenceScore or 50) / 100.0
    language_markers = text_confidence  # proxy: existing LLM confidence assessment

    score = (audio_confidence * 35 + energy_boost * 35 + language_markers * 30) * 100 / (35 + 7 + 30)
    return round(min(100.0, max(0.0, score)), 1)


def compute_clarity_score(audio: AudioAnalysisResult, interview: InterviewResult) -> float:
    """Mostly from existing text analysis; audio pace consistency adds a small component."""
    text_clarity = (interview.clarityScore or 50) / 100.0
    # Pace consistency: WPM in normal range (120-180) is clearest
    wpm = audio.paceWpm or 150
    pace_score = 1.0 - min(1.0, abs(wpm - 150) / 100.0)
    filler_penalty = max(0.0, 1.0 - (audio.fillerDensity or 0) / 15.0)

    score = (text_clarity * 75 + pace_score * 5 + filler_penalty * 20) * 100
    return round(min(100.0, max(0.0, score)), 1)


def compute_consistency_score(interview: InterviewResult) -> float:
    """Text-only. Directly from existing InterviewResult (unchanged)."""
    return round(interview.consistencyScore or 50.0, 1)
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/features/intelligence/score_computation.py
git commit -m "feat: add interview score computation functions"
```

---

## Task 5: Fill In the Celery `process_interview_audio` Task

**Files:**
- Modify: `backend/app/workers/tasks.py`

**Interfaces:**
- Consumes: `interview_id: str`, `audio_url: str`
- Produces: `InterviewAnalysis` row upserted, `JobApplication.stage = INTERVIEWED`, audio deleted from R2

- [ ] **Step 1: Replace the stub with full implementation**

```python
@celery_app.task(name="process_interview_audio", bind=True, max_retries=2)
def process_interview_audio(self, interview_id: str, audio_url: str) -> None:
    import asyncio
    from app.core.database import SyncSessionLocal
    from app.shared.models import Interview, InterviewAnalysis, InterviewStatus, JobApplication, PipelineStage, TalentProfile
    from app.features.intelligence.engines import run_interview_intelligence, run_cross_signal, run_decision_intelligence
    from app.features.intelligence.audio_analysis import run_audio_analysis, delete_from_r2
    from app.features.intelligence.score_computation import (
        compute_hesitation_score, compute_confidence_score,
        compute_clarity_score, compute_consistency_score,
    )
    from app.features.intelligence.types import TalentResult
    from app.shared.models import Decision
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    try:
        with SyncSessionLocal() as db:
            interview = db.get(Interview, interview_id)
            if not interview:
                return

            # Load application + candidate + talent profile
            app_result = db.execute(
                select(JobApplication)
                .where(JobApplication.id == interview.applicationId)
                .options(
                    selectinload(JobApplication.candidate),
                    selectinload(JobApplication.talent_profile),
                )
            )
            app = app_result.scalar_one_or_none()
            resume_text = app.candidate.resumeText if app and app.candidate else ""
            transcript = interview.transcript or ""

            # Run audio analysis (async in sync context)
            audio_result = asyncio.run(run_audio_analysis(audio_url))

            # Run text intelligence on transcript
            text_result = asyncio.run(run_interview_intelligence(transcript, resume_text))

            # Compute final scores
            hesitation = compute_hesitation_score(audio_result, text_result)
            confidence = compute_confidence_score(audio_result, text_result)
            clarity = compute_clarity_score(audio_result, text_result)
            consistency = compute_consistency_score(text_result)

            # Upsert InterviewAnalysis
            analysis = db.execute(
                select(InterviewAnalysis).where(InterviewAnalysis.interviewId == interview_id)
            ).scalar_one_or_none()
            if not analysis:
                analysis = InterviewAnalysis(interviewId=interview_id)
                db.add(analysis)

            analysis.hesitationScore = hesitation
            analysis.confidenceScore = confidence
            analysis.clarityScore = clarity
            analysis.consistencyScore = consistency
            analysis.engagementScore = text_result.engagementScore
            analysis.cognitiveSignals = text_result.cognitiveSignals
            analysis.behavioralMetrics = {
                **text_result.behavioralMetrics,
                "audioMetrics": {
                    "paceWpm": audio_result.paceWpm,
                    "pauseFrequency": audio_result.pauseFrequency,
                    "fillerDensity": audio_result.fillerDensity,
                    "energyLevel": audio_result.energyLevel,
                    "toneProfile": audio_result.toneProfile,
                }
            }
            analysis.riskFlags = text_result.riskFlags
            analysis.rawAnalysis = {"audioRaw": audio_result.rawResponse, "textRaw": text_result.rawAnalysis}

            interview.status = InterviewStatus.ANALYZED
            interview.audioUrl = audio_url

            # Run cross-signal + decision if talent profile exists
            if app and app.talent_profile:
                tp = app.talent_profile
                talent = TalentResult(
                    skills=tp.skills or [], strengths=tp.strengths or [],
                    gaps=tp.gaps or [], hiddenSignals=tp.hiddenSignals or [],
                    explanation=tp.explanation or "",
                )
                cross = asyncio.run(run_cross_signal(talent, text_result))
                decision_result = asyncio.run(run_decision_intelligence(talent, text_result))

                dec_q = db.execute(select(Decision).where(Decision.applicationId == app.id))
                decision = dec_q.scalar_one_or_none()
                if not decision:
                    decision = Decision(applicationId=app.id)
                    db.add(decision)
                decision.hireConfidence = decision_result.hireConfidence
                decision.recommendation = decision_result.recommendation
                decision.riskFactors = decision_result.riskFactors
                decision.explanation = decision_result.explanation
                decision.signalBreakdown = {
                    **decision_result.signalBreakdown,
                    "crossSignalConsistency": cross.consistencyScore,
                }

            # Update application stage
            if app:
                app.stage = PipelineStage.INTERVIEWED

            db.commit()

        # Delete audio from R2 (privacy — outside DB transaction)
        asyncio.run(delete_from_r2(audio_url))

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

- [ ] **Step 2: Test the full pipeline end-to-end**

1. Run an interview (Phase 1 working)
2. End the call — agent enqueues `process_interview_audio`
3. Check Celery worker logs — task picks up, runs audio analysis
4. Check `InterviewAnalysis` in DB — all 4 scores populated
5. Check `Interview.audioUrl` — populated, `status = ANALYZED`
6. Check R2 bucket — `.ogg` file deleted within 10 minutes

- [ ] **Step 3: Commit**

```bash
git add backend/app/workers/tasks.py
git commit -m "feat: implement full audio analysis Celery pipeline"
```

---

## Task 6: Frontend — Analysis Results Display

**Files:**
- Modify: `frontend/src/app/candidates/[id]/applications/[applicationId]/page.tsx`

**Interfaces:**
- Consumes: `InterviewAnalysis` fields from `GET /api/applications/{id}` response
- Produces: Updated scores display showing all 4 scores with audio-derived behavioral metrics

- [ ] **Step 1: Update `_serialize_interview` in `backend/app/features/applications/service.py`**

Ensure `behavioralMetrics.audioMetrics` is included in the serialized interview analysis:

```python
"behavioralMetrics": a.behavioralMetrics,  # already included — audioMetrics nested inside
```

- [ ] **Step 2: Add audio metrics to the analysis panel in the frontend**

In the interview analysis section, add a new "Audio Signals" subsection:

```typescript
{analysis.behavioralMetrics?.audioMetrics && (
  <div className="grid grid-cols-2 gap-3 mt-4">
    <MetricCard label="Speaking Pace" value={`${analysis.behavioralMetrics.audioMetrics.paceWpm?.toFixed(0)} wpm`} />
    <MetricCard label="Energy Level" value={`${(analysis.behavioralMetrics.audioMetrics.energyLevel * 100)?.toFixed(0)}%`} />
    <MetricCard label="Pause Frequency" value={`${analysis.behavioralMetrics.audioMetrics.pauseFrequency?.toFixed(1)}/min`} />
    <MetricCard label="Filler Density" value={`${analysis.behavioralMetrics.audioMetrics.fillerDensity?.toFixed(1)}/100w`} />
  </div>
)}
```

- [ ] **Step 3: Verify analysis displays correctly after a full interview**

1. Complete a full interview cycle
2. Open recruiter dashboard → application detail → interview section
3. All 4 scores visible, audio metrics panel visible

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/candidates/
git commit -m "feat: display audio-derived metrics in interview analysis panel"
```

---

## Verification Checklist

- [ ] Speaking for 30 seconds in a LiveKit room → `Interview.transcript` populated on room end
- [ ] `process_interview_audio` Celery task runs without errors after room ends
- [ ] All 4 scores populated in `InterviewAnalysis`: hesitation, confidence, clarity, consistency
- [ ] `behavioralMetrics.audioMetrics` contains pace, energy, pause frequency, filler density
- [ ] `Interview.status = ANALYZED` after pipeline completes
- [ ] `JobApplication.stage = INTERVIEWED` after pipeline completes
- [ ] `.ogg` file deleted from R2 after analysis completes
- [ ] `Decision` row created/updated when `TalentProfile` exists for the application
- [ ] Recruiter dashboard shows all 4 scores + audio metrics panel
