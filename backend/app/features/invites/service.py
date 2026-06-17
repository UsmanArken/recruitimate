import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.shared.models import Invite, Organization, OrganizationMember, Role, User


async def list_invites(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(Invite)
        .where(Invite.organizationId == org_id, Invite.acceptedAt.is_(None))
        .options(selectinload(Invite.role))
    )
    invites = result.scalars().all()
    return [
        {
            "id": inv.id,
            "email": inv.email,
            "role": {"id": inv.role.id, "code": inv.role.code, "name": inv.role.name},
            "expiresAt": inv.expiresAt,
            "createdAt": inv.createdAt,
        }
        for inv in invites
    ]


async def create_invite(org_id: str, inviter_id: str, email: str, role_id: str, db: AsyncSession) -> dict:
    role_result = await db.execute(select(Role).where(Role.id == role_id))
    if not role_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    token = secrets.token_urlsafe(32)
    invite = Invite(
        organizationId=org_id,
        email=email.lower(),
        token=token,
        roleId=role_id,
        invitedById=inviter_id,
        expiresAt=datetime.utcnow() + timedelta(days=7),
    )
    db.add(invite)
    await db.flush()
    return {"id": invite.id, "token": invite.token, "email": invite.email, "expiresAt": invite.expiresAt}


async def get_invite_by_token(token: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(Invite)
        .where(Invite.token == token)
        .options(selectinload(Invite.organization), selectinload(Invite.role))
    )
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    if invite.expiresAt < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite has expired")
    if invite.acceptedAt:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite already accepted")
    return {
        "id": invite.id,
        "email": invite.email,
        "organization": {"id": invite.organization.id, "name": invite.organization.name},
        "role": {"id": invite.role.id, "code": invite.role.code, "name": invite.role.name},
    }


async def accept_invite(token: str, name: str, password: str, db: AsyncSession) -> dict:
    result = await db.execute(select(Invite).where(Invite.token == token))
    invite = result.scalar_one_or_none()
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")
    if invite.expiresAt < datetime.utcnow() or invite.acceptedAt:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Invite is no longer valid")

    existing = await db.execute(select(User).where(User.email == invite.email))
    user = existing.scalar_one_or_none()
    if not user:
        user = User(email=invite.email, name=name, passwordHash=hash_password(password))
        db.add(user)
        await db.flush()

    existing_member = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organizationId == invite.organizationId,
            OrganizationMember.userId == user.id,
        )
    )
    if not existing_member.scalar_one_or_none():
        member = OrganizationMember(
            organizationId=invite.organizationId,
            userId=user.id,
            roleId=invite.roleId,
        )
        db.add(member)

    invite.acceptedAt = datetime.utcnow()
    await db.flush()

    role_result = await db.execute(select(Role).where(Role.id == invite.roleId))
    role = role_result.scalar_one_or_none()

    access_token = create_access_token({
        "sub": user.id,
        "organizationId": invite.organizationId,
        "roleCode": role.code if role else None,
        "isPlatformAdmin": False,
    })
    return {"access_token": access_token, "token_type": "bearer"}
