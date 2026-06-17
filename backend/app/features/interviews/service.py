from datetime import datetime

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
        "recordingPath": i.recordingPath,
        "transcript": i.transcript,
        "audioSignals": i.audioSignals,
        "videoMetricsConsentAt": i.videoMetricsConsentAt,
        "videoBehavioralMetrics": i.videoBehavioralMetrics,
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
    result = await db.execute(
        select(JobApplication).where(JobApplication.id == app_id, JobApplication.organizationId == org_id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    interview = Interview(applicationId=app_id, **data)
    db.add(interview)
    await db.flush()
    return _serialize(interview)


async def analyze_interview(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.features.intelligence.engines import (
        extract_audio_signals, run_inconsistency_check,
        run_interview_intelligence, run_interviewer_quality,
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


async def transcribe_interview(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.features.intelligence.llm_runtime import transcribe_audio
    from app.shared.storage import read_interview_recording

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.recordingPath:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No recording uploaded")

    data = read_interview_recording(interview.recordingPath)
    filename = interview.recordingPath.split("/")[-1]
    transcript = await transcribe_audio(data, filename, "audio/webm")

    interview.transcript = transcript
    interview.status = InterviewStatus.TRANSCRIBED
    await db.flush()
    return {"transcript": transcript}


async def upload_recording(interview_id: str, app_id: str, org_id: str, data: bytes, filename: str, content_type: str, db: AsyncSession) -> dict:
    from app.shared.storage import assert_recording_file, save_interview_recording

    assert_recording_file(filename, content_type, len(data))
    interview = await _load_interview(interview_id, app_id, org_id, db)
    relative_path = save_interview_recording(interview_id, data, filename)
    interview.recordingPath = relative_path
    interview.status = InterviewStatus.RECORDED
    await db.flush()
    return {"recordingPath": relative_path}


async def get_recording(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> tuple[bytes, str]:
    from app.shared.storage import read_interview_recording
    import mimetypes

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.recordingPath:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No recording")
    data = read_interview_recording(interview.recordingPath)
    mime = mimetypes.guess_type(interview.recordingPath)[0] or "application/octet-stream"
    return data, mime


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


async def extract_audio_signals(interview_id: str, app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.features.intelligence.engines import extract_audio_signals as _extract

    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not interview.transcript:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No transcript available")
    result = await _extract(interview.transcript)
    interview.audioSignals = {
        "pauseFrequency": result.pauseFrequency,
        "toneShifts": result.toneShifts,
        "hesitationMarkers": result.hesitationMarkers,
        "summary": result.summary,
    }
    await db.flush()
    return interview.audioSignals


async def store_video_metrics(interview_id: str, app_id: str, org_id: str, consent_granted: bool, metrics_data: dict | None, db: AsyncSession) -> dict:
    interview = await _load_interview(interview_id, app_id, org_id, db)
    if not consent_granted:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Consent required for video metrics")
    interview.videoMetricsConsentAt = datetime.utcnow()
    interview.videoBehavioralMetrics = metrics_data or {}
    await db.flush()
    return {"consentAt": interview.videoMetricsConsentAt, "metrics": interview.videoBehavioralMetrics}
