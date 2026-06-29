from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies import CurrentUser, DB
from app.features.invites import service
from app.features.invites.schemas import AcceptInviteRequest, CreateInviteRequest
from app.shared.permissions import require_role, ORG_ADMIN, ORG_OWNER

router = APIRouter(prefix="/api/invites", tags=["invites"])


class UpdateMemberRoleRequest(BaseModel):
    roleId: str


@router.get("")
async def list_invites(auth: CurrentUser, db: DB):
    return await service.list_invites(auth.organization_id, db)


@router.post("", status_code=201)
async def create_invite(body: CreateInviteRequest, auth: CurrentUser, db: DB):
    require_role(auth, ORG_ADMIN, ORG_OWNER)
    return await service.create_invite(auth.organization_id, auth.user_id, body.email, body.roleId, db)


@router.get("/members")
async def list_members(auth: CurrentUser, db: DB):
    return await service.list_members(auth.organization_id, db)


@router.patch("/members/{user_id}")
async def update_member_role(user_id: str, body: UpdateMemberRoleRequest, auth: CurrentUser, db: DB):
    require_role(auth, ORG_ADMIN, ORG_OWNER)
    return await service.update_member_role(auth.organization_id, user_id, body.roleId, db)


@router.delete("/members/{user_id}", status_code=204)
async def remove_member(user_id: str, auth: CurrentUser, db: DB):
    require_role(auth, ORG_ADMIN, ORG_OWNER)
    await service.remove_member(auth.organization_id, user_id, db)


@router.get("/{token}")
async def get_invite(token: str, db: DB):
    return await service.get_invite_by_token(token, db)


@router.post("/accept")
async def accept_invite(body: AcceptInviteRequest, db: DB):
    return await service.accept_invite(body.token, body.name, body.password, db)
