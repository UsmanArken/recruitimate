from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.shared.models import (
    Candidate, Job, JobApplication, Note, PipelineStage, TalentProfile, Decision
)


def _serialize_candidate(c: Candidate) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "linkedInUrl": c.linkedInUrl,
        "githubUrl": c.githubUrl,
        "portfolioUrl": c.portfolioUrl,
        "resumeText": c.resumeText,
        "source": "portal" if c.passwordHash else "manual",
        "createdAt": c.createdAt,
        "updatedAt": c.updatedAt,
    }


def _serialize_application(app: JobApplication) -> dict:
    return {
        "id": app.id,
        "stage": app.stage,
        "jobId": app.jobId,
        "candidateId": app.candidateId,
        "job": {"id": app.job.id, "title": app.job.title} if app.job else None,
        "talentProfile": _serialize_talent(app.talent_profile) if app.talent_profile else None,
        "decision": _serialize_decision(app.decision) if app.decision else None,
        "createdAt": app.createdAt,
        "updatedAt": app.updatedAt,
    }


def _serialize_talent(tp: TalentProfile) -> dict:
    return {
        "roleFitScore": tp.roleFitScore,
        "experienceYears": tp.experienceYears,
        "skills": tp.skills,
        "matchedSkills": tp.matchedSkills,
        "missingSkills": tp.missingSkills,
        "extraSkills": tp.extraSkills,
        "strengths": tp.strengths,
        "gaps": tp.gaps,
        "hiddenSignals": tp.hiddenSignals,
        "explanation": tp.explanation,
    }


def _serialize_decision(d: Decision) -> dict:
    return {
        "hireConfidence": d.hireConfidence,
        "recommendation": d.recommendation,
        "explanation": d.explanation,
    }


async def list_candidates(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Candidate).where(Candidate.organizationId == org_id)
    )
    return [_serialize_candidate(c) for c in result.scalars().all()]


async def create_candidate(org_id: str, data: dict, db: AsyncSession) -> dict:
    from app.workers.tasks import score_application

    job_id = data.pop("jobId", None)
    email = data.get("email")

    # Dedup by (organizationId, email) — reuse existing candidate if found
    candidate: Candidate | None = None
    if email:
        existing_result = await db.execute(
            select(Candidate).where(
                Candidate.organizationId == org_id,
                Candidate.email == email.lower(),
            )
        )
        candidate = existing_result.scalar_one_or_none()

    if candidate is None:
        if email:
            data["email"] = email.lower()
        candidate = Candidate(organizationId=org_id, **data)
        db.add(candidate)
        await db.flush()

    out = _serialize_candidate(candidate)
    app_id_to_score: str | None = None

    if job_id:
        job = await db.get(Job, job_id)
        if job and job.organizationId == org_id:
            # Check if already applied to this job
            dup_result = await db.execute(
                select(JobApplication).where(
                    JobApplication.candidateId == candidate.id,
                    JobApplication.jobId == job_id,
                )
            )
            existing_app = dup_result.scalar_one_or_none()
            if existing_app is None:
                app = JobApplication(
                    organizationId=org_id,
                    candidateId=candidate.id,
                    jobId=job_id,
                    stage=PipelineStage.NEW,
                )
                db.add(app)
                await db.flush()
                out["applicationId"] = app.id
                out["applications"] = [{"id": app.id, "jobId": job_id}]
                if candidate.resumeText:
                    app_id_to_score = app.id
            else:
                out["applicationId"] = existing_app.id
                out["applications"] = [{"id": existing_app.id, "jobId": job_id}]

    # Commit before enqueuing — Celery worker must find the row in the DB
    await db.commit()
    if app_id_to_score:
        score_application.delay(app_id_to_score)
    return out


async def delete_candidate(candidate_id: str, org_id: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(Candidate).where(Candidate.id == candidate_id, Candidate.organizationId == org_id)
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    await db.delete(candidate)
    await db.commit()


async def get_candidate(candidate_id: str, org_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Candidate)
        .where(Candidate.id == candidate_id, Candidate.organizationId == org_id)
        .options(
            selectinload(Candidate.applications)
            .selectinload(JobApplication.job),
            selectinload(Candidate.applications)
            .selectinload(JobApplication.talent_profile),
            selectinload(Candidate.applications)
            .selectinload(JobApplication.decision),
            selectinload(Candidate.notes)
            .selectinload(Note.author),
        )
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    out = _serialize_candidate(candidate)
    out["applications"] = [_serialize_application(a) for a in candidate.applications]
    out["notes"] = [
        {
            "id": n.id,
            "content": n.content,
            "tags": n.tags,
            "author": {"id": n.author.id, "name": n.author.name, "email": n.author.email},
            "createdAt": n.createdAt,
        }
        for n in candidate.notes
    ]
    return out


async def list_applications(candidate_id: str, org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(JobApplication)
        .where(JobApplication.candidateId == candidate_id, JobApplication.organizationId == org_id)
        .options(
            selectinload(JobApplication.job),
            selectinload(JobApplication.talent_profile),
            selectinload(JobApplication.decision),
        )
    )
    return [_serialize_application(a) for a in result.scalars().all()]


async def create_application(candidate_id: str, org_id: str, job_id: str, db: AsyncSession) -> dict:
    candidate = await db.get(Candidate, candidate_id)
    if not candidate or candidate.organizationId != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    job = await db.get(Job, job_id)
    if not job or job.organizationId != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = await db.execute(
        select(JobApplication).where(
            JobApplication.candidateId == candidate_id,
            JobApplication.jobId == job_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Application already exists")

    app = JobApplication(
        organizationId=org_id,
        candidateId=candidate_id,
        jobId=job_id,
        stage=PipelineStage.NEW,
    )
    db.add(app)
    await db.flush()
    await db.refresh(app, ["job"])
    return _serialize_application(app)


async def list_notes(candidate_id: str, org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Note)
        .join(Candidate, Note.candidateId == Candidate.id)
        .where(Note.candidateId == candidate_id, Candidate.organizationId == org_id)
        .options(selectinload(Note.author))
    )
    return [
        {
            "id": n.id,
            "content": n.content,
            "tags": n.tags,
            "author": {"id": n.author.id, "name": n.author.name},
            "createdAt": n.createdAt,
        }
        for n in result.scalars().all()
    ]


async def create_note(candidate_id: str, org_id: str, author_id: str, content: str, tags: list | None, db: AsyncSession) -> dict:
    candidate = await db.get(Candidate, candidate_id)
    if not candidate or candidate.organizationId != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    note = Note(candidateId=candidate_id, authorId=author_id, content=content, tags=tags or [])
    db.add(note)
    await db.flush()
    return {"id": note.id, "content": note.content, "tags": note.tags, "createdAt": note.createdAt}


async def update_note(note_id: str, candidate_id: str, org_id: str, data: dict, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Note)
        .join(Candidate, Note.candidateId == Candidate.id)
        .where(Note.id == note_id, Note.candidateId == candidate_id, Candidate.organizationId == org_id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    for k, v in data.items():
        if v is not None:
            setattr(note, k, v)
    await db.flush()
    return {"id": note.id, "content": note.content, "tags": note.tags, "updatedAt": note.updatedAt}


async def delete_note(note_id: str, candidate_id: str, org_id: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(Note)
        .join(Candidate, Note.candidateId == Candidate.id)
        .where(Note.id == note_id, Note.candidateId == candidate_id, Candidate.organizationId == org_id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    db.delete(note)


