import re
import secrets

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.shared.models import Organization, OrganizationMember, Role, User

PLATFORM_SUPER_ADMIN_ROLE_CODE = "PLATFORM_SUPER_ADMIN"
ORG_ADMIN_ROLE_CODE = "ORG_ADMIN"


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug + "-" + secrets.token_hex(4)


async def _sync_super_admin(db: AsyncSession) -> None:
    settings = get_settings()
    if not settings.SUPER_ADMIN_PASSWORD:
        return
    result = await db.execute(
        select(User).where(User.email == settings.SUPER_ADMIN_EMAIL.lower())
    )
    admin = result.scalar_one_or_none()
    hashed = hash_password(settings.SUPER_ADMIN_PASSWORD)
    if admin is None:
        admin = User(
            email=settings.SUPER_ADMIN_EMAIL.lower(),
            name="Platform Admin",
            passwordHash=hashed,
            isPlatformAdmin=True,
        )
        db.add(admin)
    else:
        admin.passwordHash = hashed
        admin.isPlatformAdmin = True
    await db.flush()


async def login(email: str, password: str, db: AsyncSession) -> dict:
    await _sync_super_admin(db)

    result = await db.execute(
        select(User)
        .where(User.email == email.lower())
        .options(selectinload(User.memberships).selectinload(OrganizationMember.role))
    )
    user = result.scalar_one_or_none()

    if not user or not user.passwordHash or not verify_password(password, user.passwordHash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.isPlatformAdmin:
        role_code = PLATFORM_SUPER_ADMIN_ROLE_CODE
        org_id = None
    else:
        membership = user.memberships[0] if user.memberships else None
        role_code = membership.role.code if membership else None
        org_id = membership.organizationId if membership else None

    token = create_access_token({
        "sub": user.id,
        "organizationId": org_id,
        "roleCode": role_code,
        "isPlatformAdmin": user.isPlatformAdmin,
    })
    return {"access_token": token, "token_type": "bearer"}


async def signup(email: str, password: str, name: str, org_name: str, db: AsyncSession) -> dict:
    existing = await db.execute(select(User).where(User.email == email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    org = Organization(name=org_name, slug=_slugify(org_name))
    db.add(org)
    await db.flush()

    user = User(email=email.lower(), name=name, passwordHash=hash_password(password))
    db.add(user)
    await db.flush()

    role_result = await db.execute(select(Role).where(Role.code == ORG_ADMIN_ROLE_CODE))
    role = role_result.scalar_one_or_none()
    if not role:
        from app.shared.models import RoleScope
        role = Role(code=ORG_ADMIN_ROLE_CODE, name="Admin", scope=RoleScope.ORGANIZATION)
        db.add(role)
        await db.flush()

    member = OrganizationMember(organizationId=org.id, userId=user.id, roleId=role.id)
    db.add(member)
    await db.flush()

    token = create_access_token({
        "sub": user.id,
        "organizationId": org.id,
        "roleCode": ORG_ADMIN_ROLE_CODE,
        "isPlatformAdmin": False,
    })
    return {"access_token": token, "token_type": "bearer"}


async def get_me(user_id: str, org_id: str | None, role_code: str | None, is_admin: bool, db: AsyncSession) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "organizationId": org_id,
        "roleCode": role_code,
        "isPlatformAdmin": is_admin,
    }
