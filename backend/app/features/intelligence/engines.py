"""All intelligence engines — pure async functions, no HTTP or DB access."""
from app.features.intelligence.llm_runtime import chat_json
from app.features.intelligence.types import (
    AudioSignalResult,
    CrossSignalResult,
    DecisionResult,
    InconsistencyResult,
    InterviewResult,
    InterviewerQualityResult,
    LiveAssistResult,
    TalentResult,
    VideoMetricsResult,
)

# ---------------------------------------------------------------------------
# Talent Intelligence
# ---------------------------------------------------------------------------

_TALENT_FALLBACK = {
    "skills": [],
    "experienceYears": None,
    "roleFitScore": None,
    "strengths": [],
    "gaps": [],
    "hiddenSignals": [],
    "explanation": "Analysis unavailable",
}


async def run_talent_intelligence(
    resume_text: str,
    job_requirements: str,
) -> TalentResult:
    system = (
        "You are an expert talent analyst. Analyse the candidate's resume against the job requirements. "
        "Return a JSON object with keys: skills (string[]), experienceYears (int|null), "
        "roleFitScore (0-100 float|null), strengths (string[]), gaps (string[]), "
        "hiddenSignals (string[]), explanation (string)."
    )
    user = f"JOB REQUIREMENTS:\n{job_requirements}\n\nRESUME:\n{resume_text}"
    raw = await chat_json(system, user, _TALENT_FALLBACK)
    return TalentResult(
        skills=raw.get("skills", []),
        experienceYears=raw.get("experienceYears"),
        roleFitScore=raw.get("roleFitScore"),
        strengths=raw.get("strengths", []),
        gaps=raw.get("gaps", []),
        hiddenSignals=raw.get("hiddenSignals", []),
        explanation=raw.get("explanation", ""),
    )


# ---------------------------------------------------------------------------
# Interview Intelligence
# ---------------------------------------------------------------------------

_INTERVIEW_FALLBACK = {
    "hesitationScore": None,
    "confidenceScore": None,
    "clarityScore": None,
    "consistencyScore": None,
    "engagementScore": None,
    "cognitiveSignals": {},
    "behavioralMetrics": {},
    "riskFlags": [],
    "interviewerQuality": {},
    "rawAnalysis": {},
}


async def run_interview_intelligence(
    transcript: str,
    resume_text: str = "",
) -> InterviewResult:
    system = (
        "You are an expert interview analyst. Analyse the interview transcript and return a JSON object with: "
        "hesitationScore (0-100), confidenceScore (0-100), clarityScore (0-100), consistencyScore (0-100), "
        "engagementScore (0-100), cognitiveSignals (object), behavioralMetrics (object), "
        "riskFlags (string[]), interviewerQuality (object), rawAnalysis (object)."
    )
    context = f"RESUME CONTEXT:\n{resume_text}\n\n" if resume_text else ""
    user = f"{context}TRANSCRIPT:\n{transcript}"
    raw = await chat_json(system, user, _INTERVIEW_FALLBACK)
    return InterviewResult(**{k: raw.get(k, v) for k, v in _INTERVIEW_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Decision Intelligence
# ---------------------------------------------------------------------------

_DECISION_FALLBACK = {
    "hireConfidence": None,
    "recommendation": "INSUFFICIENT_DATA",
    "riskFactors": [],
    "comparisonNotes": "",
    "explanation": "Analysis unavailable",
    "signalBreakdown": {},
}


async def run_decision_intelligence(
    talent: TalentResult,
    interview: InterviewResult | None,
) -> DecisionResult:
    system = (
        "You are a hiring decision expert. Given talent intelligence and interview results, "
        "return a JSON object with: hireConfidence (0-100 float), recommendation (HIRE|REJECT|HOLD), "
        "riskFactors (string[]), comparisonNotes (string), explanation (string), signalBreakdown (object)."
    )
    interview_section = ""
    if interview:
        interview_section = (
            f"\nINTERVIEW SIGNALS:\n"
            f"  confidence={interview.confidenceScore}, clarity={interview.clarityScore}, "
            f"  consistency={interview.consistencyScore}, risk flags={interview.riskFlags}"
        )
    user = (
        f"TALENT PROFILE:\n"
        f"  fitScore={talent.roleFitScore}, strengths={talent.strengths}, "
        f"  gaps={talent.gaps}, hiddenSignals={talent.hiddenSignals}"
        f"{interview_section}"
    )
    raw = await chat_json(system, user, _DECISION_FALLBACK)
    return DecisionResult(**{k: raw.get(k, v) for k, v in _DECISION_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Live Assist
# ---------------------------------------------------------------------------

_LIVE_ASSIST_FALLBACK = {"followUpQuestions": [], "hints": [], "redFlags": []}


async def run_live_assist(
    job_context: str,
    exchange: str,
) -> LiveAssistResult:
    system = (
        "You are a real-time interview assistant. Based on the job context and current Q&A exchange, "
        "return JSON with: followUpQuestions (string[]), hints (string[]), redFlags (string[])."
    )
    user = f"JOB CONTEXT:\n{job_context}\n\nCURRENT EXCHANGE:\n{exchange}"
    raw = await chat_json(system, user, _LIVE_ASSIST_FALLBACK)
    return LiveAssistResult(**{k: raw.get(k, v) for k, v in _LIVE_ASSIST_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Cross-Signal Engine
# ---------------------------------------------------------------------------

_CROSS_SIGNAL_FALLBACK = {"consistencyScore": None, "inconsistencies": [], "explanation": ""}


async def run_cross_signal(
    talent: TalentResult,
    interview: InterviewResult,
) -> CrossSignalResult:
    system = (
        "You are a cross-signal analyst. Compare the resume-derived talent profile with interview behaviour. "
        "Return JSON with: consistencyScore (0-100), inconsistencies (string[]), explanation (string)."
    )
    user = (
        f"TALENT: skills={talent.skills}, strengths={talent.strengths}, gaps={talent.gaps}\n"
        f"INTERVIEW: confidence={interview.confidenceScore}, consistency={interview.consistencyScore}, "
        f"riskFlags={interview.riskFlags}"
    )
    raw = await chat_json(system, user, _CROSS_SIGNAL_FALLBACK)
    return CrossSignalResult(**{k: raw.get(k, v) for k, v in _CROSS_SIGNAL_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Audio Signal Engine
# ---------------------------------------------------------------------------

_AUDIO_FALLBACK = {"pauseFrequency": None, "toneShifts": [], "hesitationMarkers": [], "summary": ""}


async def extract_audio_signals(
    transcript: str,
) -> AudioSignalResult:
    system = (
        "You are an audio signal analyst. From the interview transcript, infer pause frequency, "
        "tone shifts, and hesitation markers. Return JSON with: "
        "pauseFrequency (float|null), toneShifts (object[]), hesitationMarkers (string[]), summary (string)."
    )
    raw = await chat_json(system, transcript, _AUDIO_FALLBACK)
    return AudioSignalResult(**{k: raw.get(k, v) for k, v in _AUDIO_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Video Behavioral Engine
# ---------------------------------------------------------------------------

_VIDEO_FALLBACK = {"engagementScore": None, "attentionScore": None, "aggregates": {}}


async def extract_video_metrics(description: str) -> VideoMetricsResult:
    system = (
        "You are a video engagement analyst. Given a description of video frame data, "
        "return JSON with: engagementScore (0-100), attentionScore (0-100), aggregates (object)."
    )
    raw = await chat_json(system, description, _VIDEO_FALLBACK)
    return VideoMetricsResult(**{k: raw.get(k, v) for k, v in _VIDEO_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Interviewer Quality Engine
# ---------------------------------------------------------------------------

_IQ_FALLBACK = {"coverageScore": None, "probingDepthScore": None, "biasAdvisory": [], "summary": ""}


async def run_interviewer_quality(transcript: str) -> InterviewerQualityResult:
    system = (
        "You are an interview quality evaluator. Assess the interviewer's questions for coverage, "
        "probing depth, and potential bias. Return JSON with: "
        "coverageScore (0-100), probingDepthScore (0-100), biasAdvisory (string[]), summary (string)."
    )
    raw = await chat_json(system, transcript, _IQ_FALLBACK)
    return InterviewerQualityResult(**{k: raw.get(k, v) for k, v in _IQ_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Question Bank Engine
# ---------------------------------------------------------------------------

_QB_FALLBACK: dict = {"questions": []}


async def generate_interview_questions(
    job_title: str,
    requirements: str,
) -> list[str]:
    system = (
        "You are an expert interviewer. Generate relevant, role-specific interview questions. "
        "Return JSON with: questions (string[])."
    )
    user = f"JOB TITLE: {job_title}\n\nREQUIREMENTS:\n{requirements}"
    raw = await chat_json(system, user, _QB_FALLBACK)
    return raw.get("questions", [])


# ---------------------------------------------------------------------------
# Inconsistency Engine
# ---------------------------------------------------------------------------

_INCON_FALLBACK = {"consistencyScore": None, "evidence": [], "explanation": ""}


async def run_inconsistency_check(
    talent: TalentResult,
    interview: InterviewResult,
) -> InconsistencyResult:
    system = (
        "You are an inconsistency detector. Identify contradictions between the candidate's resume "
        "claims and interview responses. Return JSON with: "
        "consistencyScore (0-100), evidence (string[]), explanation (string)."
    )
    user = (
        f"RESUME CLAIMS: skills={talent.skills}, strengths={talent.strengths}\n"
        f"INTERVIEW: cognitiveSignals={interview.cognitiveSignals}, "
        f"behavioralMetrics={interview.behavioralMetrics}, riskFlags={interview.riskFlags}"
    )
    raw = await chat_json(system, user, _INCON_FALLBACK)
    return InconsistencyResult(**{k: raw.get(k, v) for k, v in _INCON_FALLBACK.items()})
