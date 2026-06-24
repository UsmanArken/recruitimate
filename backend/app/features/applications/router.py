from fastapi import APIRouter, status as http_status
from pydantic import BaseModel
from typing import Optional

from app.core.dependencies import CurrentUser, DB
from app.features.applications import service
from app.features.applications.schemas import LiveAssistRequest

router = APIRouter(prefix="/api/applications", tags=["applications"])


class UpdateStageRequest(BaseModel):
    stage: str


class RecruiterReviewRequest(BaseModel):
    kind: str  # "talent" | "hire"
    verdict: str  # "PENDING" | "PASS" | "HOLD" | "FAIL"
    notes: Optional[str] = None


@router.get("")
async def list_applications(auth: CurrentUser, db: DB):
    return await service.list_applications(auth.organization_id, db)


@router.get("/{application_id}")
async def get_application(application_id: str, auth: CurrentUser, db: DB):
    return await service.get_application(application_id, auth.organization_id, db)


@router.post("/{application_id}/talent", status_code=http_status.HTTP_202_ACCEPTED)
async def run_talent(application_id: str, auth: CurrentUser, db: DB):
    return await service.run_talent(application_id, auth.organization_id, db)


@router.patch("/{application_id}/status")
async def update_status(application_id: str, body: UpdateStageRequest, auth: CurrentUser, db: DB):
    return await service.update_application_stage(application_id, auth.organization_id, body.stage, db)


@router.post("/{application_id}/live-assist")
async def live_assist(application_id: str, body: LiveAssistRequest, auth: CurrentUser, db: DB):
    return await service.run_live_assist(
        application_id, auth.organization_id, body.currentQuestion, body.currentAnswer, db
    )


@router.patch("/{application_id}/recruiter-review")
async def recruiter_review(application_id: str, body: RecruiterReviewRequest, auth: CurrentUser, db: DB):
    return await service.update_recruiter_review(
        application_id, auth.organization_id, auth.user_id, body.kind, body.verdict, body.notes, db
    )
