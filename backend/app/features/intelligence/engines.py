"""All intelligence engines — pure async functions, no HTTP or DB access."""
from datetime import date

from app.features.intelligence.llm_runtime import chat_json
from app.features.intelligence.types import (
    AudioResult,
    DecisionResult,
    InterviewerQualityResult,
    LiveAssistResult,
    TalentResult,
    TranscriptResult,
)

# ---------------------------------------------------------------------------
# Call 1 — Talent Intelligence
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
        "- hiddenSignals: string[] — non-obvious positive or negative signals from the resume"
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
    )


# ---------------------------------------------------------------------------
# Call 2 — Audio Analysis (Gemini multimodal — called from tasks.py directly)
# ---------------------------------------------------------------------------
# See tasks._run_gemini_audio — runs as a separate Gemini multimodal call.
# Returns AudioResult fields: confidenceScore, clarityScore, pacingScore,
# fillerScore, energyLevel, dominantTone, emotionalVariance.


# ---------------------------------------------------------------------------
# Call 3 — Transcript + Cross-Signal (merged)
# ---------------------------------------------------------------------------

_TRANSCRIPT_FALLBACK = {
    "truthfulnessScore": None,
    "depthScore": None,
    "resumeConsistencyScore": None,
    "inconsistencies": [],
    "depthNotes": [],
    "workStyleNotes": [],
    "riskFlags": [],
}


async def run_transcript_analysis(
    transcript: str,
    resume_text: str = "",
) -> TranscriptResult:
    system = (
        "You are an expert interview analyst. You will be given a job interview transcript "
        "and the candidate's resume. Analyse both together and return a JSON object with exactly these keys:\n"
        "- truthfulnessScore: 0-100 number — how honest and consistent the candidate is overall "
        "(cross their answers with each other and with the resume)\n"
        "- depthScore: 0-100 number — depth of genuine understanding of their claimed expertise "
        "(do answers show real mastery or surface-level knowledge?)\n"
        "- resumeConsistencyScore: 0-100 number — how well the interview answers align with resume claims "
        "(100 = fully corroborated, 0 = major contradictions)\n"
        "- inconsistencies: string[] — specific contradictions between resume claims and interview answers, "
        "e.g. 'Resume claims led a team of 12 but candidate said they have never managed people'; "
        "leave empty if none found\n"
        "- depthNotes: string[] — up to 4 concise observations about reasoning quality and technical depth, "
        "e.g. 'Structured thinking: broke down the problem before answering'\n"
        "- workStyleNotes: string[] — up to 4 concise observations about communication style, "
        "collaboration, or work habits, e.g. 'Prefers autonomy over frequent check-ins'\n"
        "- riskFlags: string[] — specific candidate behaviours that warrant recruiter follow-up, "
        "e.g. 'Claimed 5 years React but could not explain hooks'; "
        "do NOT include call-quality issues (audio, technical failures); leave empty if none"
    )
    resume_section = f"RESUME:\n{resume_text}\n\n" if resume_text else ""
    user = f"{resume_section}TRANSCRIPT:\n{transcript}"
    raw = await chat_json(system, user, _TRANSCRIPT_FALLBACK)
    return TranscriptResult(**{k: raw.get(k, v) for k, v in _TRANSCRIPT_FALLBACK.items()})


# ---------------------------------------------------------------------------
# Call 4 — Decision
# ---------------------------------------------------------------------------

_DECISION_FALLBACK = {
    "recommendation": "HOLD",
    "explanation": "Analysis unavailable",
    "reasonsToHire": [],
    "reasonsToReject": [],
}


async def run_decision_intelligence(
    resume_text: str,
    transcript: str,
    job_requirements: str,
    talent: TalentResult,
    transcript_result: TranscriptResult,
    audio: AudioResult | None,
) -> DecisionResult:
    system = (
        "You are a senior hiring decision expert. You will be given a candidate's full resume, "
        "the full interview transcript, the job requirements, structured signals extracted from analysis, "
        "and audio signals from the interview. "
        "Read the raw resume and transcript directly — do not rely solely on the extracted signals. "
        "Return a JSON object with exactly these keys:\n"
        "- recommendation: must be exactly one of 'HIRE', 'LEAN_HIRE', 'HOLD', 'LEAN_REJECT', 'REJECT'\n"
        "  HIRE = strong yes; LEAN_HIRE = positive lean with minor reservations; "
        "  HOLD = genuinely uncertain, needs more info; "
        "  LEAN_REJECT = negative lean with significant concerns; REJECT = clear no\n"
        "- explanation: string — 2-3 sentences summarising the overall hiring decision\n"
        "- reasonsToHire: string[] — specific, concrete reasons that support hiring this candidate\n"
        "- reasonsToReject: string[] — specific, concrete reasons that argue against hiring this candidate"
    )

    audio_section = ""
    if audio:
        audio_section = (
            f"\nAUDIO SIGNALS:\n"
            f"  dominantTone={audio.dominantTone}, "
            f"  energyLevel={audio.energyLevel}, "
            f"  emotionalVariance={audio.emotionalVariance}, "
            f"  confidenceScore={audio.confidenceScore}"
        )

    user = (
        f"JOB REQUIREMENTS:\n{job_requirements}\n\n"
        f"RESUME:\n{resume_text}\n\n"
        f"TRANSCRIPT:\n{transcript}\n\n"
        f"EXTRACTED SIGNALS:\n"
        f"  strengths={talent.strengths}\n"
        f"  gaps={talent.gaps}\n"
        f"  hiddenSignals={talent.hiddenSignals}\n"
        f"  missingSkills={talent.missingSkills}\n"
        f"  depthNotes={transcript_result.depthNotes}\n"
        f"  workStyleNotes={transcript_result.workStyleNotes}\n"
        f"  riskFlags={transcript_result.riskFlags}\n"
        f"  inconsistencies={transcript_result.inconsistencies}"
        f"{audio_section}"
    )
    raw = await chat_json(system, user, _DECISION_FALLBACK)
    return DecisionResult(
        recommendation=raw.get("recommendation", "HOLD"),
        explanation=raw.get("explanation", "Analysis unavailable"),
        reasonsToHire=raw.get("reasonsToHire", []),
        reasonsToReject=raw.get("reasonsToReject", []),
    )


# ---------------------------------------------------------------------------
# Call 5 — Interviewer Quality
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
# Live Assist
# ---------------------------------------------------------------------------

_LIVE_ASSIST_FALLBACK = {"followUpQuestions": []}


async def run_live_assist(
    job_context: str,
    conversation: list[dict],
) -> LiveAssistResult:
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
    user = resume_text[:500]
    return await chat_json(system, user, _IDENTITY_FALLBACK)


# ---------------------------------------------------------------------------
# Question Bank
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
