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
        "type": "candidate",
    })


def _serialize_application_for_me(app: JobApplication) -> dict:
    talent = app.talent_profile
    return {
        "id": app.id,
        "jobTitle": app.job.title if app.job else None,
        "stage": app.stage,
        "roleFitScore": talent.roleFitScore if talent else None,
        "interviews": [
            {
                "id": i.id,
                "title": i.title,
                "status": i.status,
                "scheduledAt": i.scheduledAt,
                "meetingUrl": i.meetingUrl,
            }
            for i in (app.interviews or [])
        ],
    }


def _serialize_me(candidate: Candidate, applications: list[JobApplication]) -> dict:
    # Aggregate skills/experienceYears from the most recent talent profile
    latest_talent = None
    for app in sorted(applications, key=lambda a: a.createdAt, reverse=True):
        if app.talent_profile:
            latest_talent = app.talent_profile
            break

    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "linkedInUrl": candidate.linkedInUrl,
        "githubUrl": candidate.githubUrl,
        "resumeFilePath": candidate.resumeFilePath,
        "skills": latest_talent.skills if latest_talent else None,
        "experienceYears": latest_talent.experienceYears if latest_talent else None,
        "applications": [_serialize_application_for_me(a) for a in applications],
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


async def check_email(token: str, email: str, db: AsyncSession) -> dict:
    result = await db.execute(select(Job).where(Job.signupToken == token))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid signup link")

    existing_result = await db.execute(
        select(Candidate).where(
            Candidate.organizationId == job.organizationId,
            Candidate.email == email.lower(),
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing is None:
        return {"exists": False, "hasResume": False, "name": None}

    if existing.passwordHash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists — please log in.",
        )

    return {
        "exists": True,
        "hasResume": bool(existing.resumeText),
        "name": existing.name,
    }


async def candidate_signup(token: str, body: CandidateSignupRequest, db: AsyncSession) -> dict:
    result = await db.execute(select(Job).where(Job.signupToken == token))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid signup link")

    email = body.email.lower()

    # Check for existing candidate with this email in this org
    existing_result = await db.execute(
        select(Candidate).where(
            Candidate.organizationId == job.organizationId,
            Candidate.email == email,
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing is not None:
        if existing.passwordHash is not None:
            # Already has a portal account — can't create another
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists — please log in.",
            )
        # Recruiter-added candidate: claim the account
        existing.passwordHash = hash_password(body.password)
        existing.portalCreatedAt = datetime.utcnow()
        if body.linkedInUrl:
            existing.linkedInUrl = body.linkedInUrl
        if body.githubUrl:
            existing.githubUrl = body.githubUrl
        if body.resumeText:
            existing.resumeText = body.resumeText
        candidate = existing
    else:
        # New candidate
        candidate = Candidate(
            organizationId=job.organizationId,
            name=body.name,
            email=email,
            passwordHash=hash_password(body.password),
            linkedInUrl=body.linkedInUrl,
            githubUrl=body.githubUrl,
            resumeText=body.resumeText,
            portalCreatedAt=datetime.utcnow(),
        )
        db.add(candidate)
        await db.flush()

    # Create application for this job if not already applied
    dup_result = await db.execute(
        select(JobApplication).where(
            JobApplication.candidateId == candidate.id,
            JobApplication.jobId == job.id,
        )
    )
    existing_app = dup_result.scalar_one_or_none()
    if existing_app is None:
        application = JobApplication(
            organizationId=job.organizationId,
            candidateId=candidate.id,
            jobId=job.id,
            stage=PipelineStage.NEW,
        )
        db.add(application)
        await db.flush()
    else:
        application = existing_app

    # Cache values before commit — SQLAlchemy expires attributes after commit
    has_resume = bool(candidate.resumeText)
    app_id = application.id
    candidate_id = candidate.id
    candidate_name = candidate.name
    candidate_email = candidate.email

    await db.commit()

    if has_resume:
        from app.workers.tasks import score_application
        score_application.delay(app_id)

    token_str = create_access_token({"sub": candidate_id, "type": "candidate"})
    return {
        "access_token": token_str,
        "candidate": {
            "id": candidate_id,
            "name": candidate_name,
            "email": candidate_email,
        },
    }


async def candidate_login(email: str, password: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Candidate).where(
            Candidate.email == email.lower(),
            Candidate.passwordHash.isnot(None),
        )
    )
    candidates = result.scalars().all()
    # Find the one whose password matches (handles same email across multiple orgs)
    candidate = next(
        (c for c in candidates if verify_password(password, c.passwordHash)),
        None,
    )
    if not candidate:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_str = _make_candidate_token(candidate)
    return {
        "access_token": token_str,
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
        },
    }


async def get_candidate_me(candidate_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Candidate).where(Candidate.id == candidate_id)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    apps_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.candidateId == candidate_id)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.talent_profile),
            selectinload(JobApplication.interviews),
        )
        .order_by(JobApplication.createdAt.desc())
    )
    applications = list(apps_result.scalars().all())

    return _serialize_me(candidate, applications)


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
    # Cache before commit — SQLAlchemy expires attributes after commit
    candidate_id = candidate.id
    candidate_name = candidate.name
    candidate_email = candidate.email
    await db.commit()

    return {"id": candidate_id, "name": candidate_name, "email": candidate_email}


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

    # Get most recent application to re-score
    apps_result = await db.execute(
        select(JobApplication)
        .where(JobApplication.candidateId == candidate_id)
        .order_by(JobApplication.createdAt.desc())
    )
    most_recent_app = apps_result.scalars().first()
    # Cache before commit — SQLAlchemy expires attributes after commit
    most_recent_app_id = most_recent_app.id if most_recent_app else None

    await db.commit()

    if most_recent_app_id:
        from app.workers.tasks import score_application
        score_application.delay(most_recent_app_id)

    return {"status": "reanalysis_queued"}
