from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DB, OrgAdmin
from app.features.invites import service
from app.features.invites.schemas import AcceptInviteRequest, CreateInviteRequest

router = APIRouter(prefix="/api/invites", tags=["invites"])


@router.get("")
async def list_invites(auth: OrgAdmin, db: DB):
    return await service.list_invites(auth.organization_id, db)


@router.post("", status_code=201)
async def create_invite(body: CreateInviteRequest, auth: OrgAdmin, db: DB):
    return await service.create_invite(auth.organization_id, auth.user_id, body.email, body.roleId, db)


@router.get("/{token}")
async def get_invite(token: str, db: DB):
    return await service.get_invite_by_token(token, db)


@router.post("/accept")
async def accept_invite(body: AcceptInviteRequest, db: DB):
    return await service.accept_invite(body.token, body.name, body.password, db)
