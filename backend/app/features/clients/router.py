from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DB
from app.features.clients import service
from app.features.clients.schemas import (
    CreateClientRequest,
    GenerateJobDraftRequest,
    UpdateClientRequest,
)

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("")
async def list_clients(auth: CurrentUser, db: DB):
    return await service.list_clients(auth.organization_id, db)


@router.post("", status_code=201)
async def create_client(body: CreateClientRequest, auth: CurrentUser, db: DB):
    return await service.create_client(auth.organization_id, body.model_dump(exclude_none=True), db)


@router.get("/{client_id}")
async def get_client(client_id: str, auth: CurrentUser, db: DB):
    return await service.get_client(client_id, auth.organization_id, db)


@router.patch("/{client_id}")
async def update_client(client_id: str, body: UpdateClientRequest, auth: CurrentUser, db: DB):
    return await service.update_client(client_id, auth.organization_id, body.model_dump(exclude_none=True), db)


@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: str, auth: CurrentUser, db: DB):
    await service.delete_client(client_id, auth.organization_id, db)


@router.post("/{client_id}/job-draft")
async def generate_job_draft(client_id: str, body: GenerateJobDraftRequest, auth: CurrentUser, db: DB):
    return await service.generate_job_draft(client_id, auth.organization_id, body.title, db)
