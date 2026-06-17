from datetime import datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import create_access_token, hash_password, verify_password
from app.core.config import get_settings
from app.shared.models import (
    Candidate,
    Interview,
    Job,
    JobApplication,
    Organization,
    PipelineStage,
    TalentProfile,
)
from app.features.candidate_portal.schemas import (
    CandidateSignupRequest,
    UpdateCandidateMeRequest,
)


def _make_candidate_token(candidate: Candidate) -> str:
    return create_access_token({
        "sub": candidate.id,
        "jobId": candidate.jobId,
        "type": "candidate",
    })


def _serialize_me(candidate: Candidate, application: JobApplication | None, interviews: list[Interview]) -> dict:
    talent = application.talent_profile if application else None
    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "jobId": candidate.jobId,
        "linkedInUrl": candidate.linkedInUrl,
        "githubUrl": candidate.githubUrl,
        "resumeFilePath": candidate.resumeFilePath,
        "status": candidate.status,
        "applicationStage": application.stage if application else None,
        "talentProfile": {
            "skills": talent.skills,
            "experienceYears": talent.experienceYears,
        } if talent else None,
        "interviews": [
            {
                "id": i.id,
                "title": i.title,
                "status": i.status,
                "scheduledAt": i.scheduledAt,
                "meetingUrl": i.meetingUrl,
            }
            for i in interviews
        ],
    }


async def get_apply_info(token: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Job)
        .where(Job.signupToken == token)
        .options(selectinload(Job.organization))
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid signup link")
    return {
        "jobId": job.id,
        "jobTitle": job.title,
        "jobDescription": job.description,
        "orgName": job.organization.name,
        "interviewMode": job.interviewMode,
    }


async def candidate_signup(token: str, body: CandidateSignupRequest, db: AsyncSession) -> dict:
    result = await db.execute(select(Job).where(Job.signupToken == token))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid signup link")

    existing = await db.execute(
        select(Candidate).where(
            Candidate.email == body.email.lower(),
            Candidate.passwordHash.isnot(None),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    candidate = Candidate(
        organizationId=job.organizationId,
        name=body.name,
        email=body.email.lower(),
        passwordHash=hash_password(body.password),
        jobId=job.id,
        linkedInUrl=body.linkedInUrl,
        githubUrl=body.githubUrl,
        resumeText=body.resumeText,
        status="applied",
        portalCreatedAt=datetime.utcnow(),
    )
    db.add(candidate)
    await db.flush()

    application = JobApplication(
        organizationId=job.organizationId,
        candidateId=candidate.id,
        jobId=job.id,
        stage=PipelineStage.NEW,
    )
    db.add(application)
    await db.flush()

    await db.commit()

    if body.resumeText:
        from app.workers.tasks import score_candidate
        score_candidate.delay(candidate.id)

    token_str = _make_candidate_token(candidate)
    return {
        "access_token": token_str,
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "jobId": candidate.jobId,
        },
    }


async def candidate_login(email: str, password: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Candidate).where(
            Candidate.email == email.lower(),
            Candidate.passwordHash.isnot(None),
        )
    )
    candidate = result.scalar_one_or_none()
    if not candidate or not verify_password(password, candidate.passwordHash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_str = _make_candidate_token(candidate)
    return {
        "access_token": token_str,
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "jobId": candidate.jobId,
        },
    }


async def get_candidate_me(candidate_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Candidate).where(Candidate.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    app_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.candidateId == candidate_id)
        .options(selectinload(JobApplication.talent_profile))
        .order_by(JobApplication.createdAt.desc())
    )
    application = app_result.scalars().first()

    interviews: list[Interview] = []
    if application:
        iv_result = await db.execute(
            select(Interview)
            .where(Interview.applicationId == application.id)
            .order_by(Interview.scheduledAt)
        )
        interviews = list(iv_result.scalars().all())

    return _serialize_me(candidate, application, interviews)


async def update_candidate_me(candidate_id: str, body: UpdateCandidateMeRequest, db: AsyncSession) -> dict:
    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    if body.name is not None:
        candidate.name = body.name
    if body.email is not None:
        candidate.email = body.email.lower()
    if body.githubUrl is not None:
        candidate.githubUrl = body.githubUrl
    if body.linkedInUrl is not None:
        candidate.linkedInUrl = body.linkedInUrl
    candidate.updatedAt = datetime.utcnow()
    await db.commit()

    return {"id": candidate.id, "name": candidate.name, "email": candidate.email}


async def reupload_resume(candidate_id: str, file: UploadFile, db: AsyncSession) -> dict:
    from app.features.intelligence.document_parser import extract_text
    content = await file.read()
    filename = file.filename or "resume"
    text = extract_text(content, filename)

    result = await db.execute(select(Candidate).where(Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    settings = get_settings()
    import os, pathlib
    upload_dir = pathlib.Path(settings.UPLOAD_DIR) / "resumes"
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / f"{candidate_id}_{filename}"
    dest.write_bytes(content)

    candidate.resumeText = text
    candidate.resumeFilePath = str(dest)
    candidate.updatedAt = datetime.utcnow()
    await db.commit()

    from app.workers.tasks import score_candidate
    score_candidate.delay(candidate_id)

    return {"status": "reanalysis_queued"}
