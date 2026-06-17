from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import (
    Candidate, Decision, Interview, InterviewAnalysis, Job, JobApplication, TalentProfile
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
            "status": app.candidate.status,
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
        "strengths": tp.strengths,
        "gaps": tp.gaps,
        "hiddenSignals": tp.hiddenSignals,
        "explanation": tp.explanation,
    }


def _serialize_decision(d: Decision) -> dict:
    return {
        "hireConfidence": d.hireConfidence,
        "recommendation": d.recommendation,
        "riskFactors": d.riskFactors,
        "explanation": d.explanation,
        "signalBreakdown": d.signalBreakdown,
    }


def _serialize_interview(i: Interview) -> dict:
    return {
        "id": i.id,
        "title": i.title,
        "status": i.status,
        "scheduledAt": i.scheduledAt,
        "analysis": _serialize_analysis(i.analysis) if i.analysis else None,
    }


def _serialize_analysis(a: InterviewAnalysis) -> dict:
    return {
        "hesitationScore": a.hesitationScore,
        "confidenceScore": a.confidenceScore,
        "clarityScore": a.clarityScore,
        "consistencyScore": a.consistencyScore,
        "riskFlags": a.riskFlags,
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
        "candidate": {"id": a.candidate.id, "name": a.candidate.name} if a.candidate else None,
        "job": {"id": a.job.id, "title": a.job.title} if a.job else None,
        "talentProfile": {"roleFitScore": a.talent_profile.roleFitScore} if a.talent_profile else None,
        "decision": {"recommendation": a.decision.recommendation} if a.decision else None,
    } for a in apps]


async def get_application(app_id: str, org_id: str, db: AsyncSession) -> dict:
    app = await _load_application(app_id, org_id, db)
    return _serialize_application(app)


async def run_talent(app_id: str, org_id: str, db: AsyncSession) -> dict:
    from app.features.intelligence.engines import run_talent_intelligence

    app = await _load_application(app_id, org_id, db)
    if not app.candidate or not app.candidate.resumeText:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate has no resume text")
    if not app.job:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job not found")

    result = await run_talent_intelligence(
        app.candidate.resumeText,
        app.job.requirements or app.job.description or "",
    )

    if app.talent_profile:
        tp = app.talent_profile
    else:
        tp = TalentProfile(applicationId=app.id)
        db.add(tp)

    tp.skills = result.skills
    tp.experienceYears = result.experienceYears
    tp.roleFitScore = result.roleFitScore
    tp.strengths = result.strengths
    tp.gaps = result.gaps
    tp.hiddenSignals = result.hiddenSignals
    tp.explanation = result.explanation
    await db.flush()

    # Advance stage
    from app.shared.models import PipelineStage
    if app.stage == PipelineStage.NEW:
        app.stage = PipelineStage.TALENT_REVIEW
        await db.flush()

    return {"roleFitScore": tp.roleFitScore, "explanation": tp.explanation}


async def run_live_assist(app_id: str, org_id: str, current_question: str, current_answer: str | None, db: AsyncSession) -> dict:
    from app.features.intelligence.engines import run_live_assist as _live_assist

    app = await _load_application(app_id, org_id, db)
    job_context = f"{app.job.title}\n{app.job.requirements or ''}" if app.job else ""
    exchange = f"Q: {current_question}\nA: {current_answer or ''}"
    result = await _live_assist(job_context, exchange)
    return {
        "followUpQuestions": result.followUpQuestions,
        "hints": result.hints,
        "redFlags": result.redFlags,
    }
