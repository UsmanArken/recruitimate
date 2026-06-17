from fastapi import APIRouter
from sqlalchemy import select

from app.core.dependencies import CurrentUser, DB
from app.shared.models import Role, RoleScope

router = APIRouter(prefix="/api/roles", tags=["roles"])


@router.get("")
async def list_roles(auth: CurrentUser, db: DB):
    result = await db.execute(
        select(Role).where(Role.scope == RoleScope.ORGANIZATION)
    )
    roles = result.scalars().all()
    return [{"id": r.id, "code": r.code, "name": r.name, "description": r.description} for r in roles]
