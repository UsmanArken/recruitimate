from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DB
from app.features.candidates import service
from app.features.candidates.schemas import (
    CreateApplicationRequest,
    CreateCandidateRequest,
    CreateNoteRequest,
    LinkedInRequest,
    UpdateCandidateRequest,
    UpdateNoteRequest,
)
from app.shared.permissions import require_role, is_hiring_manager, HIRING_MANAGER, ORG_ADMIN, ORG_OWNER, RECRUITER

router = APIRouter(prefix="/api/candidates", tags=["candidates"])


@router.get("")
async def list_candidates(auth: CurrentUser, db: DB):
    user_id = auth.user_id if is_hiring_manager(auth) else None
    return await service.list_candidates(auth.organization_id, db, assigned_user_id=user_id)


@router.post("", status_code=201)
async def create_candidate(body: CreateCandidateRequest, auth: CurrentUser, db: DB):
    return await service.create_candidate(auth.organization_id, body.model_dump(exclude_none=True), db)


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str, auth: CurrentUser, db: DB):
    return await service.get_candidate(candidate_id, auth.organization_id, db)


@router.patch("/{candidate_id}")
async def update_candidate(candidate_id: str, body: UpdateCandidateRequest, auth: CurrentUser, db: DB):
    require_role(auth, HIRING_MANAGER, RECRUITER, ORG_ADMIN, ORG_OWNER)
    return await service.update_candidate(candidate_id, auth.organization_id, body.model_dump(exclude_none=True), db)


@router.delete("/{candidate_id}", status_code=204)
async def delete_candidate(candidate_id: str, auth: CurrentUser, db: DB):
    require_role(auth, ORG_ADMIN, ORG_OWNER)
    await service.delete_candidate(candidate_id, auth.organization_id, db)


@router.get("/{candidate_id}/applications")
async def list_applications(candidate_id: str, auth: CurrentUser, db: DB):
    return await service.list_applications(candidate_id, auth.organization_id, db)


@router.post("/{candidate_id}/applications", status_code=201)
async def create_application(candidate_id: str, body: CreateApplicationRequest, auth: CurrentUser, db: DB):
    return await service.create_application(candidate_id, auth.organization_id, body.jobId, db)


@router.get("/{candidate_id}/notes")
async def list_notes(candidate_id: str, auth: CurrentUser, db: DB):
    return await service.list_notes(candidate_id, auth.organization_id, db)


@router.post("/{candidate_id}/notes", status_code=201)
async def create_note(candidate_id: str, body: CreateNoteRequest, auth: CurrentUser, db: DB):
    return await service.create_note(
        candidate_id, auth.organization_id, auth.user_id, body.content, body.tags, db
    )


@router.put("/{candidate_id}/notes/{note_id}")
async def update_note(candidate_id: str, note_id: str, body: UpdateNoteRequest, auth: CurrentUser, db: DB):
    return await service.update_note(note_id, candidate_id, auth.organization_id, body.model_dump(exclude_none=True), db)


@router.delete("/{candidate_id}/notes/{note_id}", status_code=204)
async def delete_note(candidate_id: str, note_id: str, auth: CurrentUser, db: DB):
    await service.delete_note(note_id, candidate_id, auth.organization_id, db)


@router.post("/{candidate_id}/linkedin")
async def store_linkedin(candidate_id: str, body: LinkedInRequest, auth: CurrentUser, db: DB):
    from sqlalchemy import select
    from app.shared.models import Candidate
    result = await db.execute(
        select(Candidate).where(
            Candidate.id == candidate_id, Candidate.organizationId == auth.organization_id
        )
    )
    candidate = result.scalar_one_or_none()
    if not candidate:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    if body.linkedInUrl:
        candidate.linkedInUrl = body.linkedInUrl
    if body.profileText:
        candidate.linkedInText = body.profileText
    await db.flush()
    return {"id": candidate.id, "linkedInUrl": candidate.linkedInUrl}


