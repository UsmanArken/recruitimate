# Intelligence Pipeline

This document describes the five LLM calls that power Recruitimate's candidate evaluation system, plus the Live Assist call used during interviews. Each entry covers: when the call runs, what it receives as input, what it returns as output, and how it works.

---

## Overview

```
Resume + Job Requirements
        │
        ▼
  [Call 1] Talent Intelligence
        │ TalentResult
        │
        ├──────────────────────────┐
        ▼                          ▼
  [Call 2] Audio Analysis    [Call 3] Transcript + Cross-Signal
  (Gemini multimodal)        (text LLM)
  AudioResult                TranscriptResult
        │                          │
        └────────────┬─────────────┘
                     ▼
             [Call 4] Decision
             DecisionResult
                     │
        (parallel, same inputs)
                     ▼
        [Call 5] Interviewer Quality
        InterviewerQualityResult
```

Calls 2, 3, 4, and 5 all run post-call. Call 1 runs at resume upload. Calls 3, 4, and 5 also run on-demand via the manual "Analyze" button (without audio).

---

## Call 1 — Talent Intelligence

**Function:** `run_talent_intelligence(resume_text, job_requirements)`  
**Model:** Text LLM (Claude/GPT)  
**Triggered by:** Celery task `score_application` — runs when a candidate is added or re-analyzed  
**File:** `backend/app/features/intelligence/engines.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `resume_text` | `str` | Full resume as plain text |
| `job_requirements` | `str` | Job's requirements or description field |
| *(today's date)* | injected | Added to system prompt so the model can accurately calculate experience durations |

### Output: `TalentResult`

| Field | Type | Description |
|---|---|---|
| `skills` | `string[]` | Every technical and professional skill found anywhere in the resume |
| `matchedSkills` | `string[]` | Skills the candidate has that directly appear in the job requirements |
| `missingSkills` | `string[]` | Skills explicitly required by the job that the candidate shows no evidence of |
| `extraSkills` | `string[]` | Skills the candidate has that aren't required by the job but may be relevant |
| `experienceYears` | `int \| null` | Total years of professional experience directly relevant to this role. Only counts roles where work substantially overlaps with the job requirements — not total career length |
| `roleFitScore` | `0–100 float \| null` | Overall fit score. Anchored: 90+ = strong match on both skills and experience; 70–89 = good match with minor gaps; 50–69 = partial match worth interviewing; below 50 = significant gaps in core requirements |
| `strengths` | `string[]` | Role-specific strengths backed by evidence in the resume. Must be concrete, e.g. *"Built and shipped 3 production React apps"* — not generic praise like *"Strong frontend skills"* |
| `gaps` | `string[]` | Specific skills or experience areas from the job requirements that are absent or weak, framed as interview probes, e.g. *"No evidence of system design experience at scale"* |
| `hiddenSignals` | `string[]` | Non-obvious signals that meaningfully affect fit, positive or negative. Examples: frequent short tenures, open source contributions in the required stack, IC → lead progression, unexplained employment gaps. Generic observations are skipped |

### How it works

The model receives the raw resume and job requirements. It calculates experience years by counting only roles that substantially overlap with the job — not total career length — using today's date to compute durations from the resume. The output goes into the `TalentProfile` table and is used as supplementary input for the Decision call.

---

## Call 2 — Audio Analysis

**Function:** `_run_gemini_audio(audio_path, api_key, model_name, transcript)`  
**Model:** `gemini-2.0-flash` (multimodal — processes actual audio)  
**Triggered by:** Celery task `process_interview_audio`, only if audio was successfully uploaded to R2  
**File:** `backend/app/workers/tasks.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `audio_path` | `str` | Local path to the downloaded `.wav` file (downloaded from R2 before the call) |
| `transcript` | `str` | Full transcript text, passed alongside as alignment context only |
| `api_key` | `str` | Google API key from settings |
| `model_name` | `str` | Defaults to `gemini-2.0-flash` |

The transcript is included so Gemini can align what it hears with the words, but the prompt explicitly instructs it to base all scores strictly on **audio signals only** — tone, pace, energy, filler words, hesitations — and not to infer from the content of what was said.

### Output: `AudioResult`

| Field | Type | Description |
|---|---|---|
| `confidenceScore` | `0–100` | How assertive the candidate sounds. Anchored: 90+ = consistently assertive tone, minimal hedging, direct answers; 50–70 = mix of confident and uncertain delivery; below 50 = frequent hesitation, trailing off, upward inflection on statements |
| `clarityScore` | `0–100` | How easy the candidate is to follow. Anchored: 90+ = articulate, well-paced, easy to follow; 50–70 = mostly clear with some mumbling or run-on sentences; below 50 = frequently unclear, hard to follow, poor articulation |
| `pacingScore` | `0–100` | 50 is ideal conversational pace. Score decreases symmetrically as pace deviates — rushing through answers scores as low as speaking too slowly |
| `fillerScore` | `0–100` | Inverted — fewer filler words = higher score. 100 = no fillers; 70 = occasional fillers; below 50 = frequent um/uh/like/you know that disrupts flow |
| `energyLevel` | `0.0–1.0` | Vocal energy and engagement level. 0.8–1.0 = high vocal energy, enthusiastic and engaged; 0.4–0.7 = moderate energy, present but not animated; below 0.4 = flat, low energy, monotone delivery |
| `dominantTone` | `string` | Single word describing the overall emotional register of the candidate throughout the interview. Chosen from: *confident, nervous, enthusiastic, flat, defensive, engaged, hesitant, polished* — or another single word if none fit |
| `emotionalVariance` | `0.0–1.0` | Range of emotional expression across the interview. 0.8–1.0 = wide range, candidate sounds very different across topics; 0.3–0.6 = moderate natural variation; below 0.3 = consistently flat with little variation |

### How it works

The only multimodal call in the pipeline. Gemini receives the actual audio file and listens to it. All scores reflect purely how the candidate sounds, not what they say. This is the only call that requires a completed recording — if no audio is available (e.g. no R2 credentials configured, or the call used the manual analyze button), the audio fields are all `null` in the database and the Decision call proceeds without them.

---

## Call 3 — Transcript + Cross-Signal Analysis

**Function:** `run_transcript_analysis(transcript, resume_text)`  
**Model:** Text LLM  
**Triggered by:** Celery task `process_interview_audio` (post-call) and manual "Analyze" button  
**File:** `backend/app/features/intelligence/engines.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `transcript` | `str` | Full interview transcript text |
| `resume_text` | `str` | Candidate's resume (used for cross-referencing claims) |

### Output: `TranscriptResult`

| Field | Type | Description |
|---|---|---|
| `truthfulnessScore` | `0–100` | How honest and internally consistent the candidate is overall. Cross-checks answers against each other and against the resume |
| `depthScore` | `0–100` | Depth of genuine understanding of claimed expertise. High score = answers show real mastery; low score = surface-level or rehearsed responses |
| `resumeConsistencyScore` | `0–100` | How well interview answers align with resume claims. 100 = fully corroborated; 0 = major contradictions |
| `inconsistencies` | `string[]` | Specific contradictions between resume and interview. Each entry names both the claim and the contradiction, e.g. *"Resume claims led a team of 12 but candidate said they have never managed people"*. Empty if none found |
| `depthNotes` | `string[]` | Up to 4 concise observations about reasoning quality and technical depth, e.g. *"Structured thinking: broke down the problem before answering"* |
| `workStyleNotes` | `string[]` | Up to 4 concise observations about communication style, collaboration preferences, or work habits, e.g. *"Prefers autonomy over frequent check-ins"* |
| `riskFlags` | `string[]` | Specific behaviours that warrant recruiter follow-up. Each flag must name the claim AND the gap, e.g. *"Claimed 5 years React but could not explain hooks"* or *"Said they owned the architecture but deferred all technical questions to their manager"*. Does NOT include call quality issues (audio failures, technical problems) or subjective style preferences. Empty if no genuine red flags |

### How it works

This call merges what were previously two separate calls — transcript analysis and cross-signal checking — into one. The model receives both the raw resume and the full transcript simultaneously, so it can do cross-referencing in a single pass with full context of both documents. It looks for inconsistencies, evaluates the depth of understanding behind claims, and flags anything that warrants a follow-up question from the recruiter.

---

## Call 4 — Decision Intelligence

**Function:** `run_decision_intelligence(resume_text, transcript, job_requirements, talent, transcript_result, audio)`  
**Model:** Text LLM  
**Triggered by:** Celery task `process_interview_audio` (after Call 3) and manual "Analyze" button  
**File:** `backend/app/features/intelligence/engines.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `resume_text` | `str` | Full raw resume |
| `transcript` | `str` | Full raw interview transcript |
| `job_requirements` | `str` | Job requirements or description |
| `talent.strengths` | `string[]` | From Call 1: evidence-backed strengths |
| `talent.gaps` | `string[]` | From Call 1: specific missing areas framed as interview probes |
| `talent.hiddenSignals` | `string[]` | From Call 1: non-obvious signals affecting fit |
| `talent.missingSkills` | `string[]` | From Call 1: skills required but absent |
| `transcript_result.depthNotes` | `string[]` | From Call 3: observations about reasoning and technical depth |
| `transcript_result.workStyleNotes` | `string[]` | From Call 3: observations about communication and work habits |
| `transcript_result.riskFlags` | `string[]` | From Call 3: behaviours warranting follow-up |
| `transcript_result.inconsistencies` | `string[]` | From Call 3: contradictions between resume and interview |
| `audio.dominantTone` | `str \| null` | From Call 2: overall emotional register (if audio available) |
| `audio.energyLevel` | `float \| null` | From Call 2: vocal energy level (if audio available) |
| `audio.emotionalVariance` | `float \| null` | From Call 2: range of emotional expression (if audio available) |
| `audio.confidenceScore` | `float \| null` | From Call 2: assertiveness of delivery (if audio available) |

**Notably absent:** Numeric scores (`roleFitScore`, `truthfulnessScore`, `depthScore`, `resumeConsistencyScore`) are deliberately not passed. The model sees raw documents and qualitative notes instead, to avoid anchoring its judgment on our computed numbers.

### Output: `DecisionResult`

| Field | Type | Description |
|---|---|---|
| `recommendation` | `string` | Exactly one of: `HIRE`, `LEAN_HIRE`, `HOLD`, `LEAN_REJECT`, `REJECT`. Definitions: HIRE = strong yes; LEAN_HIRE = positive lean with minor reservations; HOLD = genuinely uncertain, needs more info; LEAN_REJECT = negative lean with significant concerns; REJECT = clear no |
| `explanation` | `string` | 2–3 sentences. Must state the single strongest reason for the recommendation and the single biggest reservation, then give the overall verdict. Must be direct — not hedged |
| `reasonsToHire` | `string[]` | Evidence-based reasons tied to the job requirements, e.g. *"Demonstrated hands-on system design experience matching the role scope"* or *"Consistent track record of ownership across 3 companies"*. No generic praise unless backed by a specific example |
| `reasonsToReject` | `string[]` | Specific concerns tied to the job requirements, e.g. *"No evidence of managing a team despite the role requiring people management"* or *"Inconsistent answers on the core technical domain suggest shallow expertise"*. No speculative concerns not grounded in the resume or transcript |

### How it works

This call receives the most raw context of any call in the pipeline — the full resume, full transcript, and job requirements directly. The model is instructed to read the raw documents itself rather than relying solely on the extracted signals, which are included as supplementary context. Numeric scores are withheld to prevent the model from anchoring its narrative on our computed values instead of forming its own independent judgment. Audio signals, when available, are included as plain text (tone, energy, variance, confidence).

---

## Call 5 — Interviewer Quality

**Function:** `run_interviewer_quality(transcript)`  
**Model:** Text LLM  
**Triggered by:** Same as Call 3 — runs in parallel with the rest of the post-call pipeline  
**File:** `backend/app/features/intelligence/engines.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `transcript` | `str` | Full interview transcript |

No resume or job requirements are passed — this call evaluates the **interviewer's conduct**, not the candidate.

### Output: `InterviewerQualityResult`

| Field | Type | Description |
|---|---|---|
| `coverageScore` | `0–100` | How thoroughly the interviewer covered the candidate's background and the role requirements. Anchored: 90+ = thorough coverage of technical skills, experience, and behavioural fit; 70–89 = covered most areas with minor gaps; below 70 = significant topic areas left unaddressed |
| `probingDepthScore` | `0–100` | How effectively the interviewer followed up on vague or incomplete answers. Anchored: 90+ = consistently drilled into specifics and challenged surface answers; 70–89 = probed some answers but accepted vague responses in others; below 70 = mostly accepted first answers without follow-up |
| `biasAdvisory` | `string[]` | Specific patterns suggesting biased or unfair interviewing. Examples: *"Asked candidate to justify career gap but did not ask same of other timeline questions"*, *"Used leading questions that signalled the desired answer"*, *"Asked questions unrelated to job requirements that may reflect demographic bias"*. Empty if no bias patterns observed |
| `summary` | `string` | 2–3 sentences assessing overall interview quality. Notes what the interviewer did well and what would improve the quality of signal gathered |

### How it works

This call evaluates the recruiter/interviewer, not the candidate. The result is stored as a JSON blob in the `InterviewAnalysis.interviewerQuality` column and displayed in a collapsible panel in the UI, separate from the candidate-facing analysis. It is a coaching signal for recruiters and plays no role in the hiring recommendation.

---

## Live Assist — Follow-up Question Suggestions

**Function:** `run_live_assist(job_context, conversation)`  
**Model:** Text LLM  
**Triggered by:** Recruiter clicking "Suggest follow-up" during an active interview  
**File:** `backend/app/features/intelligence/engines.py`

### Inputs

| Parameter | Type | Description |
|---|---|---|
| `job_context` | `str` | Job title + requirements/description concatenated |
| `conversation` | `list[dict]` | All transcript segments so far, each with `speaker`, `text`, and `timestampMs` |

### Output: `LiveAssistResult`

| Field | Type | Description |
|---|---|---|
| `followUpQuestions` | `string[]` | Exactly 3 specific follow-up questions for the recruiter to ask next |

### How it works

The model sees the full conversation so far and the job context. Hard rules baked into the prompt: don't repeat topics already covered; prioritise vague answers that need probing; surface gaps from the job context not yet addressed; make questions concrete and role-specific, not generic. Always returns exactly 3 questions.

---

## Data Flow Summary

```
INPUTS                          CALLS                   STORED IN
──────────────────────────────────────────────────────────────────
Resume + Job Requirements  →  [1] Talent          →  TalentProfile
Audio (.wav from R2)       →  [2] Audio           →  InterviewAnalysis
                               (Gemini multimodal)    (audio fields)
Transcript + Resume        →  [3] Transcript      →  InterviewAnalysis
                               + Cross-Signal         (transcript fields)
Resume + Transcript        →  [4] Decision        →  Decision
+ Job + Calls 1,2,3           (raw context
  qualitative signals)         + qualitative only)
Transcript only            →  [5] Interviewer     →  InterviewAnalysis
                               Quality                (interviewerQuality JSON)
Live conversation          →  [Live Assist]       →  not stored
+ Job context                                         (returned directly)
```
