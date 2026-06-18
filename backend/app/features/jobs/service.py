from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import AssignmentRole, Candidate, Job, JobApplication, JobAssignment, User


def _serialize_job(job: Job, application_count: int = 0) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "hiringManagerId": job.hiringManagerId,
        "organizationId": job.organizationId,
        "signupToken": job.signupToken,
        "interviewMode": job.interviewMode,
        "autoInterviewThreshold": job.autoInterviewThreshold,
        "applicationCount": application_count,
        "createdAt": job.createdAt,
        "updatedAt": job.updatedAt,
    }


async def list_jobs(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(select(Job).where(Job.organizationId == org_id))
    jobs = result.scalars().all()
    out = []
    for job in jobs:
        count = await db.scalar(select(func.count()).where(JobApplication.jobId == job.id)) or 0
        out.append(_serialize_job(job, count))
    return out


async def create_job(org_id: str, data: dict, db: AsyncSession) -> dict:
    job = Job(organizationId=org_id, **data)
    db.add(job)
    await db.flush()
    return _serialize_job(job)


async def get_job(job_id: str, org_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Job)
        .where(Job.id == job_id, Job.organizationId == org_id)
        .options(selectinload(Job.assignments).selectinload(JobAssignment.user))
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    count = await db.scalar(select(func.count()).where(JobApplication.jobId == job.id)) or 0
    out = _serialize_job(job, count)
    out["assignments"] = [
        {
            "id": a.id,
            "assignmentRole": a.assignmentRole,
            "user": {"id": a.user.id, "name": a.user.name, "email": a.user.email},
        }
        for a in job.assignments
    ]
    return out


async def update_job(job_id: str, org_id: str, data: dict, db: AsyncSession) -> dict:
    result = await db.execute(select(Job).where(Job.id == job_id, Job.organizationId == org_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    for k, v in data.items():
        setattr(job, k, v)
    await db.flush()
    return _serialize_job(job)


async def delete_job(job_id: str, org_id: str, db: AsyncSession) -> None:
    result = await db.execute(select(Job).where(Job.id == job_id, Job.organizationId == org_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    db.delete(job)


async def list_assignments(job_id: str, org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(JobAssignment)
        .join(Job, JobAssignment.jobId == Job.id)
        .where(JobAssignment.jobId == job_id, Job.organizationId == org_id)
        .options(selectinload(JobAssignment.user))
    )
    return [
        {
            "id": a.id,
            "assignmentRole": a.assignmentRole,
            "user": {"id": a.user.id, "name": a.user.name, "email": a.user.email},
        }
        for a in result.scalars().all()
    ]


async def create_assignment(job_id: str, org_id: str, user_id: str, assignment_role: str, db: AsyncSession) -> dict:
    job = await db.get(Job, job_id)
    if not job or job.organizationId != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    try:
        role_enum = AssignmentRole(assignment_role)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignment role")
    assignment = JobAssignment(jobId=job_id, userId=user_id, assignmentRole=role_enum)
    db.add(assignment)
    await db.flush()
    user = await db.get(User, user_id)
    return {
        "id": assignment.id,
        "assignmentRole": assignment.assignmentRole,
        "user": {"id": user.id, "name": user.name, "email": user.email} if user else None,
    }


async def update_assignment(assignment_id: str, job_id: str, org_id: str, assignment_role: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(JobAssignment)
        .join(Job, JobAssignment.jobId == Job.id)
        .where(JobAssignment.id == assignment_id, JobAssignment.jobId == job_id, Job.organizationId == org_id)
        .options(selectinload(JobAssignment.user))
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    try:
        assignment.assignmentRole = AssignmentRole(assignment_role)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignment role")
    await db.flush()
    return {
        "id": assignment.id,
        "assignmentRole": assignment.assignmentRole,
        "user": {"id": assignment.user.id, "name": assignment.user.name},
    }


async def delete_assignment(assignment_id: str, job_id: str, org_id: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(JobAssignment)
        .join(Job, JobAssignment.jobId == Job.id)
        .where(JobAssignment.id == assignment_id, JobAssignment.jobId == job_id, Job.organizationId == org_id)
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    await db.delete(assignment)


async def bulk_import_resumes(job_id: str, org_id: str, files: list[tuple[str, bytes]], db: AsyncSession) -> dict:
    job = await db.get(Job, job_id)
    if not job or job.organizationId != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    from app.features.intelligence.document_parser import extract_text
    from app.shared.models import PipelineStage
    from app.workers.tasks import score_application

    from app.features.intelligence.engines import extract_resume_identity

    results = []
    app_ids_to_score: list[str] = []

    for filename, data in files[:40]:
        try:
            text = extract_text(data, filename)

            # Extract real name + email from resume text; fall back to filename
            identity = await extract_resume_identity(text)
            name = identity.get("name") or filename.rsplit(".", 1)[0]
            email = identity.get("email") or None

            # Dedup by email first (most reliable), then name
            existing_candidate = None
            if email:
                res = await db.execute(
                    select(Candidate).where(
                        Candidate.organizationId == org_id,
                        Candidate.email == email,
                    )
                )
                existing_candidate = res.scalar_one_or_none()

            if not existing_candidate:
                res = await db.execute(
                    select(Candidate).where(
                        Candidate.organizationId == org_id,
                        Candidate.name == name,
                    )
                )
                existing_candidate = res.scalar_one_or_none()

            if existing_candidate:
                dup_app = await db.execute(
                    select(JobApplication).where(
                        JobApplication.candidateId == existing_candidate.id,
                        JobApplication.jobId == job_id,
                    )
                )
                dup = dup_app.scalar_one_or_none()
                if dup:
                    results.append({
                        "status": "duplicate",
                        "fileName": filename,
                        "candidateId": existing_candidate.id,
                        "applicationId": dup.id,
                        "candidateName": existing_candidate.name,
                        "roleFitScore": None,
                        "hireConfidence": None,
                        "message": "Already in pipeline for this role",
                    })
                    continue

            candidate = Candidate(organizationId=org_id, name=name, email=email, resumeText=text)
            db.add(candidate)
            await db.flush()
            app = JobApplication(
                organizationId=org_id,
                candidateId=candidate.id,
                jobId=job_id,
                stage=PipelineStage.NEW,
            )
            db.add(app)
            await db.flush()

            app_ids_to_score.append(app.id)
            results.append({
                "status": "created",
                "fileName": filename,
                "candidateId": candidate.id,
                "applicationId": app.id,
                "candidateName": candidate.name,
                "roleFitScore": None,
                "hireConfidence": None,
            })
        except Exception as exc:
            results.append({
                "status": "failed",
                "fileName": filename,
                "error": str(exc),
            })

    # Commit all rows before enqueuing — Celery worker must find them in the DB
    await db.commit()
    for app_id in app_ids_to_score:
        score_application.delay(app_id)

    return {"results": results}
