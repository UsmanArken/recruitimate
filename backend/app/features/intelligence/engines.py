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
        "- skills: string[] — all technical and professional skills found anywhere in the resume\n"
        "- matchedSkills: string[] — skills the candidate has that directly appear in the job requirements\n"
        "- missingSkills: string[] — skills explicitly required by the job that the candidate shows no evidence of\n"
        "- extraSkills: string[] — skills the candidate has that are not required by the job but may be relevant\n"
        "- experienceYears: int|null — total years of professional experience directly relevant to this role; "
        "count only roles where the work substantially overlaps with the job requirements, not total career length\n"
        "- roleFitScore: 0-100 float|null — overall fit score; "
        "anchor: 90+ = strong match on both skills and experience, 70-89 = good match with minor gaps, "
        "50-69 = partial match worth interviewing, below 50 = significant gaps in core requirements\n"
        "- strengths: string[] — role-specific strengths backed by evidence in the resume, "
        "e.g. 'Built and shipped 3 production React apps' not 'Strong frontend skills'\n"
        "- gaps: string[] — specific skills or experience areas from the job requirements that are absent or weak, "
        "framed as interview probes, e.g. 'No evidence of system design experience at scale'\n"
        "- hiddenSignals: string[] — non-obvious signals that meaningfully affect fit, positive or negative; "
        "e.g. frequent short tenures, open source contributions in the required stack, "
        "progression from IC to lead, unexplained employment gaps; skip generic observations"
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
        "- riskFlags: string[] — specific behaviours that warrant recruiter follow-up; "
        "each flag must name the claim and the gap, e.g. 'Claimed 5 years React but could not explain hooks' "
        "or 'Said they owned the architecture but deferred all technical questions to their manager'; "
        "do NOT include call-quality issues (audio, technical failures) or subjective style preferences; "
        "leave empty if there are no genuine red flags"
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
        "- explanation: string — 2-3 sentences explaining the recommendation; "
        "state the single strongest reason for the recommendation and the single biggest reservation, "
        "then give the overall verdict; be direct, not hedged\n"
        "- reasonsToHire: string[] — evidence-based reasons tied to the job requirements, "
        "e.g. 'Demonstrated hands-on system design experience matching the role scope' or "
        "'Consistent track record of ownership across 3 companies'; "
        "avoid generic praise like 'good communicator' unless backed by a specific example\n"
        "- reasonsToReject: string[] — specific concerns tied to the job requirements, "
        "e.g. 'No evidence of managing a team despite the role requiring people management' or "
        "'Inconsistent answers on the core technical domain suggest shallow expertise'; "
        "avoid speculative concerns not grounded in the resume or transcript"
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
        "You are an interview quality evaluator. Assess the interviewer's conduct and questions "
        "based on the transcript. Return a JSON object with these keys:\n"
        "- coverageScore: 0-100 — how well the interviewer covered the candidate's background and the role requirements; "
        "anchor: 90+ = thorough coverage of technical skills, experience, and behavioural fit; "
        "70-89 = covered most areas with minor gaps; below 70 = significant topic areas left unaddressed\n"
        "- probingDepthScore: 0-100 — how effectively the interviewer followed up on vague or incomplete answers; "
        "anchor: 90+ = consistently drilled into specifics and challenged surface answers; "
        "70-89 = probed some answers but accepted vague responses in others; "
        "below 70 = mostly accepted first answers without follow-up\n"
        "- biasAdvisory: string[] — specific patterns that suggest biased or unfair interviewing, "
        "e.g. 'Asked candidate to justify career gap but did not ask same of other timeline questions', "
        "'Used leading questions that signalled the desired answer', "
        "'Asked questions unrelated to job requirements that may reflect demographic bias'; "
        "leave empty if no bias patterns observed\n"
        "- summary: string — 2-3 sentences assessing the overall interview quality; "
        "note what the interviewer did well and what would improve the quality of signal gathered"
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
    user = resume_text
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


# ---------------------------------------------------------------------------
# Job Draft Generation
# ---------------------------------------------------------------------------

_JOB_DRAFT_FALLBACK = {"description": "", "requirements": "", "jobPostDocument": ""}


async def run_job_draft_intelligence(client, title: str) -> dict:
    system = (
        "You are a recruiting copywriter. Generate a job requisition draft. "
        "Return a JSON object with exactly these keys:\n"
        "- description: string — internal role summary for recruiters (2-3 sentences on the role's purpose and team context)\n"
        "- requirements: string — bullet-style must-haves for fit scoring, one requirement per line starting with '- '\n"
        "- jobPostDocument: string — polished public-facing job post copy that candidates would read; "
        "include a compelling intro, responsibilities section, and what you're looking for; "
        "professional but engaging tone"
    )
    user = (
        f"Company: {client.name}\n"
        f"Website: {client.website or 'n/a'}\n"
        f"Company profile:\n{client.companyProfile or 'Not provided'}\n\n"
        f"Role title: {title}"
    )
    return await chat_json(system, user, _JOB_DRAFT_FALLBACK)
