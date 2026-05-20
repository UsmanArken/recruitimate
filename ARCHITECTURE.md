# Recruitimate Architecture

## Product positioning

Recruitimate is **not** an ATS, interview bot, or resume screener alone. It is a **multi-layer hiring intelligence system** with deep interview cognition as the core moat.

## Layer mapping

| Layer | Module path | Inputs | Outputs |
|-------|-------------|--------|---------|
| Talent Intelligence | `src/lib/intelligence/talent/` | Resume text, job requirements | Skills, fit score, strengths/gaps, hidden signals |
| Interview Intelligence | `src/lib/intelligence/interview/` | Transcript (+ resume for consistency hints) | Cognitive/behavioral signals, risk flags |
| Decision Intelligence | `src/lib/intelligence/decision/` | Talent + interview results | Hire confidence, recommendation, explanation |

## Data flow

```
Candidate created
    → Talent Engine → TalentProfile
    → Decision Engine (talent-only)

Interview transcript submitted
    → Interview Engine → InterviewAnalysis
    → Decision Engine (talent + interview) → Decision updated
```

## Phase roadmap

### Phase 1 (MVP — current)
- Post-interview transcript analysis
- Heuristic + OpenAI analysis
- Lightweight pipeline (jobs, stages)

### Phase 2
- Real-time interview assist
- Cross-signal validation (resume vs interview)
- Audio/video ingestion + Whisper transcription
- AI-generated interview questions

### Phase 3
- Learning engine (outcome feedback)
- Predictive hiring success
- Org-level analytics

## Risk mitigations (built into design)

| Risk | Mitigation |
|------|------------|
| False truthfulness detection | Not implemented; consistency hints only |
| Black-box AI | Every output has `explanation` + per-signal `evidence` |
| UX complexity | Single candidate page shows all 3 layers |
