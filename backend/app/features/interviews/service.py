import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import Interview, InterviewAnalysis, InterviewStatus, Job, JobApplication


async def _load_interview(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> Interview:
    result = await db.execute(
        select(Interview)
        .join(JobApplication, Interview.applicationId == JobApplication.id)
        .where(
            Interview.id == interview_id,
            Interview.applicationId == app_id,
            JobApplication.organizationId == org_id,
        )
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


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


async def list_interviews(app_id: str, org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Interview)
        .join(JobApplication, Interview.applicationId == JobApplication.id)
        .where(Interview.applicationId == app_id, JobApplication.organizationId == org_id)
        .options(selectinload(Interview.analysis))
    )
    return [_serialize(i) for i in result.scalars().all()]


async def create_interview(app_id: str, org_id: str, data: dict, db: AsyncSession) -> dict:
    from app.features.livekit.client import create_room, generate_token, build_candidate_join_url

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
    candidate_join_url = build_candidate_join_url(candidate_token)

    interview = Interview(
        applicationId=app_id,
        livekitRoomName=room_name,
        candidateJoinUrl=candidate_join_url,
        agentStatus="pending",
        **data,
    )
    db.add(interview)
    await db.flush()

    # Generate recruiter token (not stored — use /token endpoint for fresh tokens)
    recruiter_token = generate_token(
        room_name=room_name,
        participant_identity=f"recruiter-{org_id}",
        participant_name="Recruiter",
    )
    from app.core.config import get_settings
    recruiter_join_url = f"{get_settings().APP_URL}/interview/join?token={recruiter_token}"

    serialized = _serialize(interview)
    serialized["recruiterJoinUrl"] = recruiter_join_url
    return serialized


async def get_interview_token(
    interview_id: str, app_id: str, org_id: str, user_identity: str, user_name: str, db: AsyncSession
) -> dict:
    from app.features.livekit.client import generate_token
    from app.core.config import get_settings

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.livekitRoomName:
        raise HTTPException(status_code=400, detail="Interview has no LiveKit room")

    token = generate_token(
        room_name=interview.livekitRoomName,
        participant_identity=user_identity,
        participant_name=user_name,
    )
    settings = get_settings()
    join_url = f"{settings.APP_URL}/interview/join?token={token}"
    return {"token": token, "joinUrl": join_url, "roomName": interview.livekitRoomName}


async def analyze_interview(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.features.intelligence.engines import run_transcript_analysis, run_interviewer_quality, run_decision_intelligence
    from app.features.intelligence.types import TalentResult

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.transcript:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No transcript available")

    app_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.id == app_id)
        .options(
            selectinload(JobApplication.candidate),
            selectinload(JobApplication.job),
            selectinload(JobApplication.talent_profile),
        )
    )
    app = app_result.scalar_one_or_none()
    resume_text = (app.candidate.resumeText if app and app.candidate else "") or ""
    job_requirements = ""
    if app and app.job:
        job_requirements = (app.job.requirements or app.job.description or "") or ""

    # Call 3: transcript + cross-signal
    transcript_result = await run_transcript_analysis(interview.transcript, resume_text)
    # Call 5: interviewer quality
    iq = await run_interviewer_quality(interview.transcript)

    if interview.analysis:
        analysis = interview.analysis
    else:
        analysis = InterviewAnalysis(interviewId=interview.id)
        db.add(analysis)

    analysis.truthfulnessScore = transcript_result.truthfulnessScore
    analysis.depthScore = transcript_result.depthScore
    analysis.resumeConsistencyScore = transcript_result.resumeConsistencyScore
    analysis.inconsistencies = transcript_result.inconsistencies
    analysis.depthNotes = transcript_result.depthNotes
    analysis.workStyleNotes = transcript_result.workStyleNotes
    analysis.riskFlags = transcript_result.riskFlags
    analysis.interviewerQuality = {
        "coverageScore": iq.coverageScore,
        "probingDepthScore": iq.probingDepthScore,
        "biasAdvisory": iq.biasAdvisory,
        "summary": iq.summary,
    }
    interview.status = InterviewStatus.ANALYZED

    # Call 4: decision (requires talent profile)
    if app and app.talent_profile:
        tp = app.talent_profile
        talent = TalentResult(
            skills=tp.skills or [],
            matchedSkills=tp.matchedSkills or [],
            missingSkills=tp.missingSkills or [],
            extraSkills=tp.extraSkills or [],
            experienceYears=tp.experienceYears,
            roleFitScore=tp.roleFitScore,
            strengths=tp.strengths or [],
            gaps=tp.gaps or [],
            hiddenSignals=tp.hiddenSignals or [],
        )
        decision_result = await run_decision_intelligence(
            resume_text=resume_text,
            transcript=interview.transcript,
            job_requirements=job_requirements,
            talent=talent,
            transcript_result=transcript_result,
            audio=None,
        )

        from app.shared.models import Decision
        dec_q = await db.execute(select(Decision).where(Decision.applicationId == app_id))
        decision = dec_q.scalar_one_or_none()
        if not decision:
            decision = Decision(applicationId=app_id)
            db.add(decision)
        decision.recommendation = decision_result.recommendation
        decision.explanation = decision_result.explanation
        decision.reasonsToHire = decision_result.reasonsToHire
        decision.reasonsToReject = decision_result.reasonsToReject

    await db.flush()
    return {
        "truthfulnessScore": analysis.truthfulnessScore,
        "depthScore": analysis.depthScore,
        "resumeConsistencyScore": analysis.resumeConsistencyScore,
        "riskFlags": analysis.riskFlags,
    }


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


async def get_live_transcript(
    interview_id: str, app_id: str, org_id: str, db: AsyncSession
) -> dict:
    from app.shared.models import LiveTranscriptSegment
    from sqlalchemy import select

    await _load_interview(interview_id, app_id, org_id, db)
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


async def suggest_followup(
    interview_id: str, app_id: str, org_id: str, db: AsyncSession
) -> dict:
    from app.shared.models import LiveTranscriptSegment
    from app.features.intelligence.engines import run_live_assist
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload

    await _load_interview(interview_id, app_id, org_id, db)

    seg_result = await db.execute(
        select(LiveTranscriptSegment)
        .where(LiveTranscriptSegment.interviewId == interview_id)
        .order_by(LiveTranscriptSegment.timestampMs)
    )
    segments = seg_result.scalars().all()
    if not segments:
        return {"followUpQuestions": []}

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


async def generate_calendar(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> bytes:
    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.scheduledAt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview has no scheduled time")

    from datetime import timedelta
    from icalendar import Calendar, Event

    cal = Calendar()
    cal.add("prodid", "-//Recruitimate//EN")
    cal.add("version", "2.0")
    event = Event()
    event.add("summary", interview.title)
    event.add("dtstart", interview.scheduledAt)
    event.add("dtend", interview.scheduledAt + timedelta(minutes=interview.durationMinutes))
    if interview.meetingUrl:
        event.add("url", interview.meetingUrl)
        event.add("location", interview.meetingUrl)
    cal.add_component(event)
    return cal.to_ical()
