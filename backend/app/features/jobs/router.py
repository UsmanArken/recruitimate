from fastapi import APIRouter, UploadFile

from app.core.dependencies import AdminOrRecruiter, CurrentUser, DB, OrgAdmin
from app.features.intelligence.engines import generate_interview_questions
from app.features.jobs import service
from app.features.jobs.schemas import (
    CreateAssignmentRequest,
    CreateJobRequest,
    UpdateAssignmentRequest,
    UpdateJobRequest,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("")
async def list_jobs(auth: CurrentUser, db: DB):
    return await service.list_jobs(auth.organization_id, db)


@router.post("", status_code=201)
async def create_job(body: CreateJobRequest, auth: AdminOrRecruiter, db: DB):
    return await service.create_job(auth.organization_id, body.model_dump(exclude_none=True), db)


@router.get("/{job_id}")
async def get_job(job_id: str, auth: CurrentUser, db: DB):
    return await service.get_job(job_id, auth.organization_id, db)


@router.put("/{job_id}")
async def update_job(job_id: str, body: UpdateJobRequest, auth: AdminOrRecruiter, db: DB):
    return await service.update_job(job_id, auth.organization_id, body.model_dump(exclude_none=True), db)


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, auth: OrgAdmin, db: DB):
    await service.delete_job(job_id, auth.organization_id, db)


@router.post("/{job_id}/bulk-resumes")
async def bulk_resumes(job_id: str, files: list[UploadFile], auth: AdminOrRecruiter, db: DB):
    file_data = [(f.filename or "resume", await f.read()) for f in files]
    return await service.bulk_import_resumes(job_id, auth.organization_id, file_data, db)


@router.get("/{job_id}/interview-questions")
async def interview_questions(job_id: str, auth: CurrentUser, db: DB):
    from sqlalchemy import select
    from app.shared.models import Job
    result = await db.execute(select(Job).where(Job.id == job_id, Job.organizationId == auth.organization_id))
    job = result.scalar_one_or_none()
    if not job:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    questions = await generate_interview_questions(job.title, job.requirements or "")
    return {"questions": questions}


@router.get("/{job_id}/assignments")
async def list_assignments(job_id: str, auth: CurrentUser, db: DB):
    return await service.list_assignments(job_id, auth.organization_id, db)


@router.post("/{job_id}/assignments", status_code=201)
async def create_assignment(job_id: str, body: CreateAssignmentRequest, auth: AdminOrRecruiter, db: DB):
    return await service.create_assignment(job_id, auth.organization_id, body.userId, body.assignmentRole, db)


@router.put("/{job_id}/assignments/{assignment_id}")
async def update_assignment(job_id: str, assignment_id: str, body: UpdateAssignmentRequest, auth: AdminOrRecruiter, db: DB):
    return await service.update_assignment(assignment_id, job_id, auth.organization_id, body.assignmentRole, db)


@router.delete("/{job_id}/assignments/{assignment_id}", status_code=204)
async def delete_assignment(job_id: str, assignment_id: str, auth: AdminOrRecruiter, db: DB):
    await service.delete_assignment(assignment_id, job_id, auth.organization_id, db)
