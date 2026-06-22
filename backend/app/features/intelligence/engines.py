"""All intelligence engines — pure async functions, no HTTP or DB access."""
from datetime import date

from app.features.intelligence.llm_runtime import chat_json
from app.features.intelligence.types import (
    CrossSignalResult,
    DecisionResult,
    InconsistencyResult,
    InterviewResult,
    InterviewerQualityResult,
    LiveAssistResult,
    TalentResult,
)

# ---------------------------------------------------------------------------
# Talent Intelligence
# ---------------------------------------------------------------------------

_TALENT_FALLBACK = {
    "skills": [],
    "matchedSkills": [],
    "missingSkills": [],
    "extraSkills": [],
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
    today = date.today().isoformat()
    system = (
        f"You are an expert talent analyst. Today's date is {today}. "
        "Use this date to accurately calculate experience durations from resumes. "
        "Analyse the candidate's resume against the job requirements. "
        "Return a JSON object with these keys:\n"
        "- skills: string[] — all skills the candidate has\n"
        "- matchedSkills: string[] — skills the candidate has that are required by the job\n"
        "- missingSkills: string[] — skills required by the job that the candidate lacks\n"
        "- extraSkills: string[] — skills the candidate has that are not required by the job\n"
        "- experienceYears: int|null — total years of relevant professional experience\n"
        "- roleFitScore: 0-100 float|null — overall fit score\n"
        "- strengths: string[] — candidate's key strengths for this role\n"
        "- gaps: string[] — areas to probe in interview\n"
        "- hiddenSignals: string[] — non-obvious positive or negative signals\n"
        "- explanation: string — 2-3 sentence summary of the assessment"
    )
    user = f"JOB REQUIREMENTS:\n{job_requirements}\n\nRESUME:\n{resume_text}"
    raw = await chat_json(system, user, _TALENT_FALLBACK)
    return TalentResult(
        skills=raw.get("skills", []),
        matchedSkills=raw.get("matchedSkills", []),
        missingSkills=raw.get("missingSkills", []),
        extraSkills=raw.get("extraSkills", []),
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
    "cognitiveSignals": {"items": []},
    "behavioralMetrics": {"workStyleNotes": []},
    "riskFlags": [],
}


async def run_interview_intelligence(
    transcript: str,
    resume_text: str = "",
) -> InterviewResult:
    system = (
        "You are an expert interview analyst. Analyse the interview transcript and return a JSON object with exactly these keys:\n"
        "- hesitationScore: 0-100 number\n"
        "- confidenceScore: 0-100 number\n"
        "- clarityScore: 0-100 number\n"
        "- consistencyScore: 0-100 number\n"
        "- engagementScore: 0-100 number\n"
        "- cognitiveSignals: object with key 'items' — array of up to 4 strings, each a concise observation about problem-solving, reasoning, or technical depth (e.g. 'Structured thinking: broke down problem before answering')\n"
        "- behavioralMetrics: object with key 'workStyleNotes' — array of up to 4 strings, each a concise observation about communication style, collaboration, or work habits (e.g. 'Prefers autonomy over team check-ins')\n"
        "- riskFlags: string[] — specific candidate behaviours that warrant follow-up, e.g. 'Claimed 5 years React but could not explain hooks'; leave empty if no genuine flags\n"
        "Do NOT include call-quality issues (no audio, technical failures) in riskFlags."
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
    "recommendation": "HOLD",
    "riskFactors": [],
    "explanation": "Analysis unavailable",
    "signalBreakdown": {
        "technicalFit": "unclear",
        "communication": "unclear",
        "culturalFit": "unclear",
        "reliability": "unclear",
    },
}


async def run_decision_intelligence(
    talent: TalentResult,
    interview: InterviewResult | None,
) -> DecisionResult:
    system = (
        "You are a hiring decision expert. Given talent intelligence and interview results, "
        "return a JSON object with exactly these keys:\n"
        "- hireConfidence: 0-100 float\n"
        "- recommendation: must be exactly one of 'HIRE', 'HOLD', or 'REJECT'\n"
        "- riskFactors: string[] — specific reasons for concern\n"
        "- explanation: string — 2-3 sentence summary of the hiring decision\n"
        "- signalBreakdown: object with exactly these 4 keys, each with value 'strong', 'moderate', 'weak', or 'unclear':\n"
        "    technicalFit, communication, culturalFit, reliability"
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
    result = DecisionResult(
        hireConfidence=raw.get("hireConfidence"),
        recommendation=raw.get("recommendation", "HOLD"),
        riskFactors=raw.get("riskFactors", []),
        explanation=raw.get("explanation", "Analysis unavailable"),
        signalBreakdown={
            "technicalFit": raw.get("signalBreakdown", {}).get("technicalFit", "unclear"),
            "communication": raw.get("signalBreakdown", {}).get("communication", "unclear"),
            "culturalFit": raw.get("signalBreakdown", {}).get("culturalFit", "unclear"),
            "reliability": raw.get("signalBreakdown", {}).get("reliability", "unclear"),
        },
    )
    return result


# ---------------------------------------------------------------------------
# Live Assist
# ---------------------------------------------------------------------------

_LIVE_ASSIST_FALLBACK = {"followUpQuestions": []}


async def run_live_assist(
    job_context: str,
    conversation: list[dict],
) -> LiveAssistResult:
    """
    conversation: [{"speaker": "recruiter"|"candidate", "text": "...", "ts": 1200}, ...]
    Returns 3 follow-up questions based on the full conversation so far.
    """
    formatted = "\n".join(
        f"{seg['speaker'].capitalize()}: {seg['text']}"
        for seg in conversation
    )
    system = (
        "You are a live interview assistant helping a recruiter conduct a job interview. "
        "Given the full conversation so far and the job context, suggest exactly 3 specific "
        "follow-up questions the recruiter should ask next. "
        "Rules: do not repeat topics already covered; prioritise vague answers that need probing; "
        "surface gaps from the job context not yet addressed; make questions concrete and "
        "role-specific, not generic. "
        "Return JSON with one key: followUpQuestions (string[], exactly 3 items)."
    )
    user = f"JOB CONTEXT:\n{job_context}\n\nCONVERSATION SO FAR:\n{formatted}"
    raw = await chat_json(system, user, _LIVE_ASSIST_FALLBACK)
    return LiveAssistResult(followUpQuestions=raw.get("followUpQuestions", []))


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
# Resume Identity Extraction
# ---------------------------------------------------------------------------

_IDENTITY_FALLBACK = {"name": None, "email": None}


async def extract_resume_identity(resume_text: str) -> dict:
    """Extract candidate name and email from the top of a resume. Fast, cheap call."""
    system = (
        "You are a resume parser. Extract the candidate's full name and email address "
        "from the resume text. Return JSON with exactly two keys: "
        "name (string|null) and email (string|null). "
        "Return null for either field if it cannot be found. Do not infer or guess."
    )
    # Only send the first 500 chars — name/email are always near the top
    user = resume_text[:500]
    return await chat_json(system, user, _IDENTITY_FALLBACK)


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
