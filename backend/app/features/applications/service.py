from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import (
    Candidate, Decision, Interview, InterviewAnalysis, Job, JobApplication, PipelineStage, TalentProfile
)


def _serialize_application(app: JobApplication) -> dict:
    return {
        "id": app.id,
        "stage": app.stage,
        "candidateId": app.candidateId,
        "jobId": app.jobId,
        "candidate": {
            "id": app.candidate.id,
            "name": app.candidate.name,
            "email": app.candidate.email,
            "source": "portal" if app.candidate.passwordHash else "manual",
        } if app.candidate else None,
        "job": {"id": app.job.id, "title": app.job.title} if app.job else None,
        "talentProfile": _serialize_talent(app.talent_profile) if app.talent_profile else None,
        "decision": _serialize_decision(app.decision) if app.decision else None,
        "interviews": [_serialize_interview(i) for i in (app.interviews or [])],
        "createdAt": app.createdAt,
        "updatedAt": app.updatedAt,
    }


def _serialize_talent(tp: TalentProfile) -> dict:
    return {
        "id": tp.id,
        "roleFitScore": tp.roleFitScore,
        "skills": tp.skills,
        "matchedSkills": tp.matchedSkills,
        "missingSkills": tp.missingSkills,
        "extraSkills": tp.extraSkills,
        "experienceYears": tp.experienceYears,
        "strengths": tp.strengths,
        "gaps": tp.gaps,
        "hiddenSignals": tp.hiddenSignals,
        "explanation": tp.explanation,
    }


def _serialize_decision(d: Decision) -> dict:
    return {
        "recommendation": d.recommendation,
        "explanation": d.explanation,
        "reasonsToHire": d.reasonsToHire,
        "reasonsToReject": d.reasonsToReject,
    }


def _serialize_interview(i: Interview) -> dict:
    return {
        "id": i.id,
        "title": i.title,
        "status": i.status,
        "scheduledAt": i.scheduledAt,
        "meetingUrl": i.meetingUrl,
        "transcript": i.transcript,
        "livekitRoomName": i.livekitRoomName,
        "candidateJoinUrl": i.candidateJoinUrl,
        "agentStatus": i.agentStatus,
        "analysis": _serialize_analysis(i.analysis) if i.analysis else None,
    }


def _serialize_analysis(a: InterviewAnalysis) -> dict:
    return {
        # Audio scores (Call 2)
        "confidenceScore": a.confidenceScore,
        "clarityScore": a.clarityScore,
        "pacingScore": a.pacingScore,
        "fillerScore": a.fillerScore,
        "energyLevel": a.energyLevel,
        "dominantTone": a.dominantTone,
        "emotionalVariance": a.emotionalVariance,
        # Transcript + cross-signal (Call 3)
        "truthfulnessScore": a.truthfulnessScore,
        "depthScore": a.depthScore,
        "resumeConsistencyScore": a.resumeConsistencyScore,
        "inconsistencies": a.inconsistencies,
        "depthNotes": a.depthNotes,
        "workStyleNotes": a.workStyleNotes,
        "riskFlags": a.riskFlags,
        # Interviewer quality (Call 5)
        "interviewerQuality": a.interviewerQuality,
    }


async def _load_application(app_id: str, org_id: str, db: AsyncSession) -> JobApplication:
    result = await db.execute(
        select(JobApplication)
        .where(JobApplication.id == app_id, JobApplication.organizationId == org_id)
        .options(
            selectinload(JobApplication.candidate),
            selectinload(JobApplication.job),
            selectinload(JobApplication.talent_profile),
            selectinload(JobApplication.decision),
            selectinload(JobApplication.interviews).selectinload(Interview.analysis),
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return app


async def list_applications(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(JobApplication)
        .where(JobApplication.organizationId == org_id)
        .options(
            selectinload(JobApplication.candidate),
            selectinload(JobApplication.job),
            selectinload(JobApplication.talent_profile),
            selectinload(JobApplication.decision),
        )
    )
    apps = result.scalars().all()
    return [{
        "id": a.id,
        "stage": a.stage,
        "candidate": {
            "id": a.candidate.id,
            "name": a.candidate.name,
            "email": a.candidate.email,
            "source": "portal" if a.candidate.passwordHash else "manual",
        } if a.candidate else None,
        "job": {"id": a.job.id, "title": a.job.title} if a.job else None,
        "talentProfile": {"roleFitScore": a.talent_profile.roleFitScore} if a.talent_profile else None,
        "decision": {
            "recommendation": a.decision.recommendation,
        } if a.decision else None,
    } for a in apps]


async def get_application(app_id: str, org_id: str, db: AsyncSession) -> dict:
    app = await _load_application(app_id, org_id, db)
    return _serialize_application(app)


async def run_talent(app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.workers.tasks import score_application

    app = await _load_application(app_id, org_id, db)
    if not app.candidate or not app.candidate.resumeText:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate has no resume text")
    if not app.job:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job not found")

    score_application.delay(app_id)
    return {"status": "queued"}


async def update_application_stage(app_id: str, org_id: str, stage: str, db: AsyncSession) -> dict:
    valid_stages = {s.value for s in PipelineStage}
    if stage not in valid_stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage. Must be one of: {', '.join(sorted(valid_stages))}",
        )
    result = await db.execute(
        select(JobApplication).where(
            JobApplication.id == app_id,
            JobApplication.organizationId == org_id,
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    new_stage = PipelineStage(stage)
    app.stage = new_stage
    app_id = app.id
    await db.commit()
    return {"id": app_id, "stage": new_stage}


