# Interview Intelligence — Phase 3: Facial Signal Analysis + Final Score Fusion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Human.js in-browser facial signal capture during live interviews (emotion scores, gaze direction, attention, blink rate — sampled every 500ms). Aggregate ~5,400 packets per 30-min interview into a facial summary. Detect cross-modal conflicts (audio tone vs. facial expression). Feed facial data into the final Gemini signal fusion prompt to upgrade the confidence score and add a new `behavioralMetrics.facialSignals` section to `InterviewAnalysis`.

**Architecture:** Three additions on top of Phase 2. (1) **Frontend:** Human.js WASM runs in the candidate's browser during the call, sends signal packets every 500ms to `POST /api/interviews/{id}/signals` via WebSocket or batched HTTP. (2) **Backend:** Signal packets stored temporarily in Redis during the session; aggregated into a `FacialSummary` on room end. (3) **Post-interview pipeline:** Celery `process_interview_audio` extended — after audio analysis, runs facial aggregation + cross-modal conflict detection + Gemini signal fusion with all inputs combined.

**Tech Stack:** `@vladmandic/human` (MIT, no license needed), existing LiveKit video call page, Redis (already running for Celery), existing Celery pipeline from Phase 2, Gemini 2.5 Flash (already wired).

## Global Constraints

- Branch: `interview-ai-analysis` (same branch, Phase 3 continues after Phase 2)
- Phase 2 must be complete before starting Phase 3
- Human.js is MIT licensed — no purchase needed
- No video stored — only numeric signal packets (privacy)
- Facial signals stored temporarily in Redis during session, aggregated to JSON in DB after
- `InterviewAnalysis.behavioralMetrics` extended with `facialSignals` key — no schema migration needed (it's already a JSON column)
- Confidence score formula updated: audio(35%) + facial(35%) + language(30%) — replaces Phase 2's audio-only proxy

---

## Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/app/interview/[roomId]/facial-tracker.tsx` | Client component — runs Human.js, captures + sends signal packets |
| `backend/app/features/interviews/signals_router.py` | `POST /api/interviews/{id}/signals` — batch signal ingestion |
| `backend/app/features/intelligence/facial_aggregation.py` | Aggregates raw packets → `FacialSummary` dataclass |
| `backend/app/features/intelligence/cross_modal.py` | Detects audio/facial conflicts |
| `backend/app/features/intelligence/signal_fusion.py` | Gemini prompt combining all signals → final report |

## Files to Modify

| File | Change |
|------|--------|
| `frontend/src/app/interview/[roomId]/video-call.tsx` | Mount `FacialTracker` component alongside `VideoConference` |
| `backend/app/features/intelligence/types.py` | Add `FacialSummary`, `CrossModalConflict`, `FusionResult` dataclasses |
| `backend/app/features/intelligence/score_computation.py` | Update `compute_confidence_score` to include facial data |
| `backend/app/workers/tasks.py` | Extend `process_interview_audio` to run facial aggregation + cross-modal + fusion |
| `backend/app/main.py` | Register `signals_router` |
| `frontend/package.json` | Add `@vladmandic/human` |

---

## Task 1: New Types

**Files:**
- Modify: `backend/app/features/intelligence/types.py`

- [ ] **Step 1: Add 3 new dataclasses to `types.py`**

```python
@dataclass
class FacialSummary:
    attentionTimeline: list[dict] = field(default_factory=list)
    # [{timeMs: int, attention: float, emotion: str, gazeX: float, gazeY: float}]
    dominantEmotions: dict[str, float] = field(default_factory=dict)
    # {"happy": 0.12, "neutral": 0.55, "fear": 0.08, ...}
    eyeContactPercent: float | None = None
    stressMoments: list[dict] = field(default_factory=list)
    # [{timeMs: int, duration: int, emotion: str}]
    emotionalStabilityScore: float | None = None  # 0-1
    lookAwayEvents: int | None = None
    blinkRatePerMinute: float | None = None
    averageAttention: float | None = None  # 0-1
    faceDetectedPercent: float | None = None  # % of time face was visible


@dataclass
class CrossModalConflict:
    conflictScore: float | None = None  # 0-1, higher = more conflicts
    conflicts: list[dict] = field(default_factory=list)
    # [{"timeMs": int, "audioSignal": str, "facialSignal": str, "interpretation": str}]
    explanation: str = ""


@dataclass
class FusionResult:
    hesitationScore: float | None = None
    confidenceScore: float | None = None
    clarityScore: float | None = None
    consistencyScore: float | None = None
    overallAssessment: str = ""
    keyStrengths: list[str] = field(default_factory=list)
    keyRisks: list[str] = field(default_factory=list)
    rawResponse: dict[str, Any] = field(default_factory=dict)
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/features/intelligence/types.py
git commit -m "feat: add FacialSummary, CrossModalConflict, FusionResult types"
```

---

## Task 2: Signal Ingestion Endpoint

**Files:**
- Create: `backend/app/features/interviews/signals_router.py`
- Modify: `backend/app/main.py`

**Interfaces:**
- Consumes: `POST /api/interviews/{interview_id}/signals` with body `{packets: [{timeMs, emotions, gaze, attention, blinkRate, faceDetected}]}`
- Produces: Packets stored in Redis list `signals:{interview_id}` with TTL 2 hours

- [ ] **Step 1: Create `signals_router.py`**

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
import json
from app.core.redis import get_redis
from app.core.dependencies import CurrentCandidate

router = APIRouter()


class SignalPacket(BaseModel):
    timeMs: int
    emotions: dict[str, float]   # {"happy": 0.1, "neutral": 0.7, ...}
    gazeX: float                  # -1 to 1 (left to right)
    gazeY: float                  # -1 to 1 (up to down)
    attention: float              # 0-1
    blinkRate: float              # blinks per minute
    faceDetected: bool


class SignalBatch(BaseModel):
    packets: list[SignalPacket]


@router.post("/api/interviews/{interview_id}/signals")
async def ingest_signals(
    interview_id: str,
    body: SignalBatch,
    auth: CurrentCandidate,
):
    if not body.packets:
        return {"stored": 0}

    redis = await get_redis()
    key = f"signals:{interview_id}"
    pipe = redis.pipeline()
    for packet in body.packets:
        pipe.rpush(key, json.dumps(packet.model_dump()))
    pipe.expire(key, 7200)  # 2 hour TTL
    await pipe.execute()

    return {"stored": len(body.packets)}
```

- [ ] **Step 2: Add Redis helper if not already present**

Check if `backend/app/core/redis.py` exists. If not, create it:

```python
import redis.asyncio as aioredis
from app.core.config import settings

_redis_client = None

async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client
```

- [ ] **Step 3: Register router in `main.py`**

```python
from app.features.interviews.signals_router import router as signals_router
app.include_router(signals_router)
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/features/interviews/signals_router.py backend/app/core/redis.py backend/app/main.py
git commit -m "feat: add facial signal ingestion endpoint"
```

---

## Task 3: Human.js Frontend Integration

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/src/app/interview/[roomId]/facial-tracker.tsx`
- Modify: `frontend/src/app/interview/[roomId]/video-call.tsx`

**Interfaces:**
- Consumes: `interviewId` prop, webcam video stream (accessed locally via `getUserMedia`)
- Produces: Signal packets POSTed to `/api/interviews/{interviewId}/signals` every 500ms

- [ ] **Step 1: Install Human.js**

```bash
cd frontend
npm install @vladmandic/human
```

- [ ] **Step 2: Create `facial-tracker.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import type Human from "@vladmandic/human";

interface Props {
  interviewId: string;
  candidateToken: string;
}

const HUMAN_CONFIG = {
  backend: "webgl" as const,
  modelBasePath: "https://cdn.jsdelivr.net/npm/@vladmandic/human/models/",
  face: {
    enabled: true,
    detector: { rotation: false },
    emotion: { enabled: true },
    iris: { enabled: true },
    attention: { enabled: true },
  },
  body: { enabled: false },
  hand: { enabled: false },
  gesture: { enabled: false },
};

export function FacialTracker({ interviewId, candidateToken }: Props) {
  const humanRef = useRef<Human | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const packetBuffer = useRef<object[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { default: HumanLib } = await import("@vladmandic/human");
      const human = new HumanLib(HUMAN_CONFIG);
      await human.load();
      await human.warmup();
      humanRef.current = human;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      videoRef.current = video;

      // Capture every 500ms
      intervalRef.current = setInterval(async () => {
        if (cancelled || !humanRef.current || !videoRef.current) return;
        try {
          const result = await humanRef.current.detect(videoRef.current);
          const face = result.face?.[0];
          if (!face) {
            packetBuffer.current.push({
              timeMs: Date.now(),
              emotions: {},
              gazeX: 0, gazeY: 0,
              attention: 0,
              blinkRate: 0,
              faceDetected: false,
            });
            return;
          }

          const emotions = face.emotion?.reduce((acc: Record<string, number>, e: { emotion: string; score: number }) => {
            acc[e.emotion] = e.score;
            return acc;
          }, {}) ?? {};

          packetBuffer.current.push({
            timeMs: Date.now(),
            emotions,
            gazeX: face.iris?.[0]?.x ?? 0,
            gazeY: face.iris?.[0]?.y ?? 0,
            attention: face.attention ?? 0.5,
            blinkRate: face.rotation?.matrix?.[0] ?? 0,
            faceDetected: true,
          });

          // Flush every 10 packets (~5 seconds)
          if (packetBuffer.current.length >= 10) {
            const batch = [...packetBuffer.current];
            packetBuffer.current = [];
            await fetch(`/api/interviews/${interviewId}/signals`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${candidateToken}`,
              },
              body: JSON.stringify({ packets: batch }),
            });
          }
        } catch {
          // Non-fatal — packet lost, continue
        }
      }, 500);
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, [interviewId, candidateToken]);

  // Invisible — no UI, runs in background
  return null;
}
```

- [ ] **Step 3: Mount `FacialTracker` in `video-call.tsx`**

Add `FacialTracker` alongside `VideoConference`. Pass `interviewId` and `candidateToken` as props. Only render for candidates (not recruiters):

```typescript
import { FacialTracker } from "./facial-tracker";

// In the LiveKitRoom children:
{isCandidate && interviewId && (
  <FacialTracker interviewId={interviewId} candidateToken={token} />
)}
```

Update `VideoCall` component props to accept `isCandidate: boolean` and `interviewId: string`.

Update `page.tsx` to pass `isCandidate` based on whether the token's identity starts with `candidate-`:

```typescript
// Decode token (JWT, no verification needed client-side — just read identity)
function isTokenForCandidate(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.identity ?? "").startsWith("candidate-");
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Test Human.js captures signals**

1. Join a room as candidate
2. Open browser DevTools Network tab — filter for `/signals`
3. Verify batches of 10 packets POST every ~5 seconds
4. Check Redis: `redis-cli LLEN signals:{interviewId}` — count should grow

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/interview/ frontend/package.json frontend/package-lock.json
git commit -m "feat: add Human.js facial signal capture to video call"
```

---

## Task 4: Facial Signal Aggregation

**Files:**
- Create: `backend/app/features/intelligence/facial_aggregation.py`

**Interfaces:**
- Consumes: Raw packets from Redis `signals:{interview_id}`
- Produces: `FacialSummary` dataclass

- [ ] **Step 1: Create `facial_aggregation.py`**

```python
import json
from app.features.intelligence.types import FacialSummary


def aggregate_facial_signals(packets_json: list[str]) -> FacialSummary:
    """Aggregate raw Human.js signal packets into a FacialSummary."""
    if not packets_json:
        return FacialSummary()

    packets = [json.loads(p) for p in packets_json]
    total = len(packets)
    face_detected_count = sum(1 for p in packets if p.get("faceDetected"))

    # Attention timeline (sample every 10th packet for storage efficiency)
    attention_timeline = [
        {
            "timeMs": p["timeMs"],
            "attention": p.get("attention", 0),
            "emotion": _dominant_emotion(p.get("emotions", {})),
            "gazeX": p.get("gazeX", 0),
            "gazeY": p.get("gazeY", 0),
        }
        for p in packets[::10]
    ]

    # Aggregate emotion scores
    emotion_totals: dict[str, float] = {}
    for p in packets:
        for emotion, score in p.get("emotions", {}).items():
            emotion_totals[emotion] = emotion_totals.get(emotion, 0) + score
    dominant_emotions = {k: round(v / total, 3) for k, v in emotion_totals.items()}

    # Eye contact: gaze within ±0.3 of center = looking at camera
    eye_contact_count = sum(
        1 for p in packets
        if abs(p.get("gazeX", 0)) < 0.3 and abs(p.get("gazeY", 0)) < 0.3 and p.get("faceDetected")
    )
    eye_contact_percent = round(eye_contact_count / max(face_detected_count, 1) * 100, 1)

    # Stress moments: high fear/anxiety emotion score for 3+ consecutive packets
    stress_moments = _find_stress_moments(packets)

    # Emotional stability: variance in dominant emotion over time
    emotions_over_time = [_dominant_emotion(p.get("emotions", {})) for p in packets if p.get("faceDetected")]
    stability = _compute_emotional_stability(emotions_over_time)

    # Look-away events: gaze moves outside ±0.5 for 2+ consecutive packets
    look_away_events = _count_look_away_events(packets)

    avg_attention = round(sum(p.get("attention", 0) for p in packets if p.get("faceDetected")) / max(face_detected_count, 1), 3)
    avg_blink_rate = round(sum(p.get("blinkRate", 0) for p in packets if p.get("faceDetected")) / max(face_detected_count, 1), 1)

    return FacialSummary(
        attentionTimeline=attention_timeline,
        dominantEmotions=dominant_emotions,
        eyeContactPercent=eye_contact_percent,
        stressMoments=stress_moments,
        emotionalStabilityScore=stability,
        lookAwayEvents=look_away_events,
        blinkRatePerMinute=avg_blink_rate,
        averageAttention=avg_attention,
        faceDetectedPercent=round(face_detected_count / total * 100, 1),
    )


def _dominant_emotion(emotions: dict) -> str:
    if not emotions:
        return "neutral"
    return max(emotions, key=emotions.get)  # type: ignore


def _find_stress_moments(packets: list[dict]) -> list[dict]:
    stress_emotions = {"fear", "angry", "disgusted", "sad"}
    moments = []
    streak = 0
    start = None
    for p in packets:
        dominant = _dominant_emotion(p.get("emotions", {}))
        if dominant in stress_emotions and p.get("faceDetected"):
            if streak == 0:
                start = p["timeMs"]
            streak += 1
        else:
            if streak >= 3:
                moments.append({"timeMs": start, "duration": streak * 500, "emotion": dominant})
            streak = 0
    return moments


def _compute_emotional_stability(emotions: list[str]) -> float:
    if len(emotions) < 2:
        return 1.0
    changes = sum(1 for i in range(1, len(emotions)) if emotions[i] != emotions[i - 1])
    return round(1.0 - (changes / len(emotions)), 3)


def _count_look_away_events(packets: list[dict]) -> int:
    events = 0
    looking_away = False
    for p in packets:
        if not p.get("faceDetected"):
            continue
        away = abs(p.get("gazeX", 0)) > 0.5 or abs(p.get("gazeY", 0)) > 0.5
        if away and not looking_away:
            events += 1
        looking_away = away
    return events
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/features/intelligence/facial_aggregation.py
git commit -m "feat: add facial signal aggregation"
```

---

## Task 5: Cross-Modal Conflict Detection

**Files:**
- Create: `backend/app/features/intelligence/cross_modal.py`

**Interfaces:**
- Consumes: `AudioAnalysisResult`, `FacialSummary`
- Produces: `CrossModalConflict`

- [ ] **Step 1: Create `cross_modal.py`**

```python
from app.features.intelligence.types import AudioAnalysisResult, FacialSummary, CrossModalConflict

# Emotions that conflict with confident audio tone
AUDIO_FACIAL_CONFLICT_MAP = {
    "confident": {"fear": "coached/masked anxiety", "angry": "suppressed frustration", "sad": "low morale despite confident tone"},
    "nervous": {"happy": "nervous-positive mismatch — possible performance anxiety"},
    "assertive": {"fear": "assertive language with fearful expression — rehearsed behavior"},
}


def detect_cross_modal_conflicts(audio: AudioAnalysisResult, facial: FacialSummary) -> CrossModalConflict:
    conflicts = []
    dominant_audio_tone = (audio.toneProfile or {}).get("dominant", "neutral").lower()
    dominant_facial_emotion = max(facial.dominantEmotions, key=facial.dominantEmotions.get) if facial.dominantEmotions else "neutral"

    # Check audio/facial dominant signal conflict
    if dominant_audio_tone in AUDIO_FACIAL_CONFLICT_MAP:
        conflict_map = AUDIO_FACIAL_CONFLICT_MAP[dominant_audio_tone]
        if dominant_facial_emotion in conflict_map:
            conflicts.append({
                "timeMs": 0,
                "audioSignal": f"audio tone: {dominant_audio_tone}",
                "facialSignal": f"facial emotion: {dominant_facial_emotion}",
                "interpretation": conflict_map[dominant_facial_emotion],
            })

    # Eye contact + confidence mismatch
    if dominant_audio_tone == "confident" and (facial.eyeContactPercent or 100) < 40:
        conflicts.append({
            "timeMs": 0,
            "audioSignal": "confident tone",
            "facialSignal": f"low eye contact ({facial.eyeContactPercent}%)",
            "interpretation": "confident speech with avoidant gaze — possible social anxiety or dishonesty indicator",
        })

    # High stress moments + neutral/positive audio
    if len(facial.stressMoments) > 3 and dominant_audio_tone in ("confident", "neutral", "assertive"):
        conflicts.append({
            "timeMs": 0,
            "audioSignal": f"stable {dominant_audio_tone} tone",
            "facialSignal": f"{len(facial.stressMoments)} stress moments detected",
            "interpretation": "vocal composure masking visible stress — high coaching likelihood",
        })

    conflict_score = min(1.0, len(conflicts) * 0.3)

    explanation_parts = [c["interpretation"] for c in conflicts]
    explanation = "; ".join(explanation_parts) if explanation_parts else "No significant cross-modal conflicts detected."

    return CrossModalConflict(
        conflictScore=round(conflict_score, 2),
        conflicts=conflicts,
        explanation=explanation,
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/features/intelligence/cross_modal.py
git commit -m "feat: add cross-modal audio/facial conflict detection"
```

---

## Task 6: Gemini Signal Fusion

**Files:**
- Create: `backend/app/features/intelligence/signal_fusion.py`

**Interfaces:**
- Consumes: transcript, `AudioAnalysisResult`, `FacialSummary`, `CrossModalConflict`, resume text, job description
- Produces: `FusionResult` with final 4 scores + assessment

- [ ] **Step 1: Create `signal_fusion.py`**

```python
import json
from app.features.intelligence.types import (
    AudioAnalysisResult, FacialSummary, CrossModalConflict, FusionResult
)

FUSION_PROMPT = """You are an expert interview analyst. You have been given multi-modal data from a job interview. Synthesize all signals into a final assessment.

## Transcript
{transcript}

## Audio Analysis
{audio_summary}

## Facial Signal Summary
{facial_summary}

## Cross-Modal Conflicts
{conflicts}

## Candidate Resume
{resume}

## Job Requirements
{job_requirements}

Based on ALL of the above, provide final scores and assessment:

- **Hesitation Score (0-100):** Based on pause frequency, filler density, and audio tone drops. Higher = less hesitation.
- **Confidence Score (0-100):** Audio tone (35%) + facial signals (35%) + language markers (30%). Consider cross-modal conflicts.
- **Clarity Score (0-100):** Answer structure, question relevance, filler density, pace consistency.
- **Consistency Score (0-100):** Resume vs interview claims, cross-answer contradictions, technical depth.

Return ONLY valid JSON:
{{
  "hesitationScore": <0-100>,
  "confidenceScore": <0-100>,
  "clarityScore": <0-100>,
  "consistencyScore": <0-100>,
  "overallAssessment": "<2-3 sentence summary>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "keyRisks": ["<risk 1>", "<risk 2>"]
}}"""


async def run_signal_fusion(
    transcript: str,
    audio: AudioAnalysisResult,
    facial: FacialSummary,
    conflicts: CrossModalConflict,
    resume_text: str,
    job_requirements: str,
) -> FusionResult:
    import google.generativeai as genai
    from app.core.config import settings

    genai.configure(api_key=getattr(settings, "GOOGLE_API_KEY", "") or getattr(settings, "GEMINI_API_KEY", ""))
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = FUSION_PROMPT.format(
        transcript=transcript[:4000],
        audio_summary=json.dumps({
            "tone": audio.toneProfile,
            "energyLevel": audio.energyLevel,
            "paceWpm": audio.paceWpm,
            "pauseFrequency": audio.pauseFrequency,
            "fillerDensity": audio.fillerDensity,
        }, indent=2),
        facial_summary=json.dumps({
            "eyeContactPercent": facial.eyeContactPercent,
            "averageAttention": facial.averageAttention,
            "emotionalStabilityScore": facial.emotionalStabilityScore,
            "dominantEmotions": facial.dominantEmotions,
            "stressMomentsCount": len(facial.stressMoments),
            "lookAwayEvents": facial.lookAwayEvents,
        }, indent=2),
        conflicts=json.dumps({"conflictScore": conflicts.conflictScore, "conflicts": conflicts.conflicts}, indent=2),
        resume=resume_text[:2000],
        job_requirements=job_requirements[:1000],
    )

    response = model.generate_content(prompt)
    raw = json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())

    return FusionResult(
        hesitationScore=raw.get("hesitationScore"),
        confidenceScore=raw.get("confidenceScore"),
        clarityScore=raw.get("clarityScore"),
        consistencyScore=raw.get("consistencyScore"),
        overallAssessment=raw.get("overallAssessment", ""),
        keyStrengths=raw.get("keyStrengths", []),
        keyRisks=raw.get("keyRisks", []),
        rawResponse=raw,
    )
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/features/intelligence/signal_fusion.py
git commit -m "feat: add Gemini multi-modal signal fusion engine"
```

---

## Task 7: Extend Celery Pipeline with Facial + Fusion

**Files:**
- Modify: `backend/app/workers/tasks.py`

**Interfaces:**
- Consumes: `signals:{interview_id}` from Redis, `FacialSummary`, `CrossModalConflict`, `FusionResult`
- Produces: Final scores written to `InterviewAnalysis`, Redis key deleted, `overallAssessment` stored in `rawAnalysis`

- [ ] **Step 1: Extend `process_interview_audio` in `tasks.py`**

After the audio analysis section and before `db.commit()`, add:

```python
# Fetch facial signals from Redis
import asyncio as _asyncio
from app.core.redis import get_redis as _get_redis
from app.features.intelligence.facial_aggregation import aggregate_facial_signals
from app.features.intelligence.cross_modal import detect_cross_modal_conflicts
from app.features.intelligence.signal_fusion import run_signal_fusion

async def _get_signals(interview_id: str) -> list[str]:
    r = await _get_redis()
    return await r.lrange(f"signals:{interview_id}", 0, -1)

async def _delete_signals(interview_id: str):
    r = await _get_redis()
    await r.delete(f"signals:{interview_id}")

raw_signals = _asyncio.run(_get_signals(interview_id))
facial_summary = aggregate_facial_signals(raw_signals)

conflicts = detect_cross_modal_conflicts(audio_result, facial_summary)

# Get job requirements for fusion
job_requirements = ""
if app and app.job:
    job_requirements = app.job.requirements or ""

fusion = _asyncio.run(run_signal_fusion(
    transcript=transcript,
    audio=audio_result,
    facial=facial_summary,
    conflicts=conflicts,
    resume_text=resume_text,
    job_requirements=job_requirements,
))

# Use fusion scores as final scores (override Phase 2 computed scores)
hesitation = fusion.hesitationScore or hesitation
confidence = fusion.confidenceScore or confidence
clarity = fusion.clarityScore or clarity
consistency = fusion.consistencyScore or consistency

# Store facial signals in behavioralMetrics
analysis.behavioralMetrics = {
    **text_result.behavioralMetrics,
    "audioMetrics": { ... },  # same as Phase 2
    "facialSignals": {
        "eyeContactPercent": facial_summary.eyeContactPercent,
        "averageAttention": facial_summary.averageAttention,
        "emotionalStabilityScore": facial_summary.emotionalStabilityScore,
        "dominantEmotions": facial_summary.dominantEmotions,
        "stressMomentsCount": len(facial_summary.stressMoments),
        "lookAwayEvents": facial_summary.lookAwayEvents,
        "blinkRatePerMinute": facial_summary.blinkRatePerMinute,
        "faceDetectedPercent": facial_summary.faceDetectedPercent,
        "crossModalConflicts": conflicts.conflicts,
        "conflictScore": conflicts.conflictScore,
    },
    "fusion": {
        "overallAssessment": fusion.overallAssessment,
        "keyStrengths": fusion.keyStrengths,
        "keyRisks": fusion.keyRisks,
    }
}
```

After `db.commit()` and audio deletion, add:
```python
# Delete facial signals from Redis
_asyncio.run(_delete_signals(interview_id))
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/workers/tasks.py
git commit -m "feat: extend Celery pipeline with facial aggregation, cross-modal detection, and signal fusion"
```

---

## Task 8: Frontend — Display Facial Signals in Analysis Panel

**Files:**
- Modify: `frontend/src/app/candidates/[id]/applications/[applicationId]/page.tsx`

- [ ] **Step 1: Add facial signals section to analysis panel**

```typescript
{analysis.behavioralMetrics?.facialSignals && (
  <div className="space-y-3 mt-4">
    <h4 className="text-sm font-semibold">Facial Signals</h4>
    <div className="grid grid-cols-2 gap-3">
      <MetricCard label="Eye Contact" value={`${analysis.behavioralMetrics.facialSignals.eyeContactPercent}%`} />
      <MetricCard label="Avg Attention" value={`${(analysis.behavioralMetrics.facialSignals.averageAttention * 100).toFixed(0)}%`} />
      <MetricCard label="Emotional Stability" value={`${(analysis.behavioralMetrics.facialSignals.emotionalStabilityScore * 100).toFixed(0)}%`} />
      <MetricCard label="Look-Away Events" value={`${analysis.behavioralMetrics.facialSignals.lookAwayEvents}`} />
    </div>
    {analysis.behavioralMetrics.facialSignals.crossModalConflicts?.length > 0 && (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold text-amber-800 mb-1">Cross-Modal Signals</p>
        {analysis.behavioralMetrics.facialSignals.crossModalConflicts.map((c: any, i: number) => (
          <p key={i} className="text-xs text-amber-700">{c.interpretation}</p>
        ))}
      </div>
    )}
    {analysis.behavioralMetrics.fusion?.overallAssessment && (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-xs font-semibold mb-1">AI Assessment</p>
        <p className="text-sm">{analysis.behavioralMetrics.fusion.overallAssessment}</p>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/candidates/
git commit -m "feat: display facial signals and fusion assessment in analysis panel"
```

---

## Verification Checklist

- [ ] Human.js loads in browser without errors (check console)
- [ ] Signal packets POST to `/api/interviews/{id}/signals` every ~5 seconds during call
- [ ] `redis-cli LLEN signals:{interviewId}` grows during interview
- [ ] After room ends, Celery task fetches signals from Redis
- [ ] `FacialSummary` has non-null `eyeContactPercent`, `averageAttention`, `emotionalStabilityScore`
- [ ] `CrossModalConflict.conflicts` correctly identifies audio/facial mismatches (test with exaggerated expressions)
- [ ] `FusionResult` returns 4 scores and `overallAssessment`
- [ ] Final `InterviewAnalysis` has `behavioralMetrics.facialSignals` and `behavioralMetrics.fusion`
- [ ] Redis `signals:{interviewId}` key deleted after analysis
- [ ] Recruiter dashboard shows eye contact %, attention %, cross-modal conflicts, and AI assessment
- [ ] No facial signals for recruiter participant (only candidate runs Human.js)
