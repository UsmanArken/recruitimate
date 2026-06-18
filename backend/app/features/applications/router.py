from fastapi import APIRouter, status as http_status

from app.core.dependencies import CurrentUser, DB
from app.features.applications import service
from app.features.applications.schemas import LiveAssistRequest

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.get("")
async def list_applications(auth: CurrentUser, db: DB):
    return await service.list_applications(auth.organization_id, db)


@router.get("/{application_id}")
async def get_application(application_id: str, auth: CurrentUser, db: DB):
    return await service.get_application(application_id, auth.organization_id, db)


@router.post("/{application_id}/talent", status_code=http_status.HTTP_202_ACCEPTED)
async def run_talent(application_id: str, auth: CurrentUser, db: DB):
    return await service.run_talent(application_id, auth.organization_id, db)


@router.post("/{application_id}/live-assist")
async def live_assist(application_id: str, body: LiveAssistRequest, auth: CurrentUser, db: DB):
    return await service.run_live_assist(
        application_id, auth.organization_id, body.currentQuestion, body.currentAnswer, db
    )
