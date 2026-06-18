import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import Interview, InterviewAnalysis, InterviewStatus, JobApplication


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
    from app.features.livekit.client import build_candidate_join_url as _build_url
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
    from app.features.intelligence.engines import (
        run_inconsistency_check,
        run_interview_intelligence,
        run_interviewer_quality,
    )
    from app.shared.models import TalentProfile

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.transcript:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No transcript available")

    app_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.id == app_id)
        .options(
            selectinload(JobApplication.candidate),
            selectinload(JobApplication.talent_profile),
        )
    )
    app = app_result.scalar_one_or_none()
    resume_text = app.candidate.resumeText if app and app.candidate else ""

    result = await run_interview_intelligence(interview.transcript, resume_text)
    iq = await run_interviewer_quality(interview.transcript)

    if interview.analysis:
        analysis = interview.analysis
    else:
        analysis = InterviewAnalysis(interviewId=interview.id)
        db.add(analysis)

    analysis.hesitationScore = result.hesitationScore
    analysis.confidenceScore = result.confidenceScore
    analysis.clarityScore = result.clarityScore
    analysis.consistencyScore = result.consistencyScore
    analysis.engagementScore = result.engagementScore
    analysis.cognitiveSignals = result.cognitiveSignals
    analysis.behavioralMetrics = result.behavioralMetrics
    analysis.riskFlags = result.riskFlags
    analysis.interviewerQuality = {"coverageScore": iq.coverageScore, "probingDepthScore": iq.probingDepthScore, "biasAdvisory": iq.biasAdvisory}
    interview.status = InterviewStatus.ANALYZED

    if app and app.talent_profile:
        from app.features.intelligence.engines import run_cross_signal, run_decision_intelligence
        from app.features.intelligence.types import TalentResult
        tp = app.talent_profile
        talent = TalentResult(
            skills=tp.skills or [],
            strengths=tp.strengths or [],
            gaps=tp.gaps or [],
            hiddenSignals=tp.hiddenSignals or [],
            explanation=tp.explanation or "",
        )
        cross = await run_cross_signal(talent, result)
        decision_result = await run_decision_intelligence(talent, result)

        from app.shared.models import Decision
        dec_q = await db.execute(select(Decision).where(Decision.applicationId == app_id))
        decision = dec_q.scalar_one_or_none()
        if not decision:
            decision = Decision(applicationId=app_id)
            db.add(decision)
        decision.hireConfidence = decision_result.hireConfidence
        decision.recommendation = decision_result.recommendation
        decision.riskFactors = decision_result.riskFactors
        decision.explanation = decision_result.explanation
        decision.signalBreakdown = {**decision_result.signalBreakdown, "crossSignalConsistency": cross.consistencyScore}

    await db.flush()
    return {
        "hesitationScore": analysis.hesitationScore,
        "confidenceScore": analysis.confidenceScore,
        "clarityScore": analysis.clarityScore,
        "consistencyScore": analysis.consistencyScore,
        "riskFlags": analysis.riskFlags,
    }


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
