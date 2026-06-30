import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.shared.models import Invite, Organization, OrganizationMember, Role, User


async def list_members(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(OrganizationMember)
        .where(OrganizationMember.organizationId == org_id)
        .options(selectinload(OrganizationMember.user), selectinload(OrganizationMember.role))
    )
    members = result.scalars().all()
    return [
        {
            "id": m.userId,
            "name": m.user.name,
            "email": m.user.email,
            "role": {"id": m.role.id, "code": m.role.code, "name": m.role.name},
            "joinedAt": m.createdAt,
        }
        for m in members
    ]


async def update_member_role(org_id: str, user_id: str, role_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(OrganizationMember)
        .where(OrganizationMember.organizationId == org_id, OrganizationMember.userId == user_id)
        .options(selectinload(OrganizationMember.user), selectinload(OrganizationMember.role))
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    role_result = await db.execute(select(Role).where(Role.id == role_id))
    role = role_result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")

    member.roleId = role_id
    await db.commit()
    await db.refresh(member)

    result2 = await db.execute(
        select(OrganizationMember)
        .where(OrganizationMember.organizationId == org_id, OrganizationMember.userId == user_id)
        .options(selectinload(OrganizationMember.user), selectinload(OrganizationMember.role))
    )
    member = result2.scalar_one()
    return {
        "id": member.userId,
        "name": member.user.name,
        "email": member.user.email,
        "role": {"id": member.role.id, "code": member.role.code, "name": member.role.name},
        "joinedAt": member.createdAt,
    }


async def remove_member(org_id: str, user_id: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organizationId == org_id,
            OrganizationMember.userId == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    await db.delete(member)
    await db.commit()


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
            "token": inv.token,
            "role": {"id": inv.role.id, "code": inv.role.code, "name": inv.role.name},
            "expiresAt": inv.expiresAt,
            "createdAt": inv.createdAt,
        }
        for inv in invites
    ]


async def create_invite(org_id: str | None, inviter_id: str, email: str, role_id: str, db: AsyncSession) -> dict:
    if not org_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admins cannot send invites — log in as an organization member")
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
    await db.commit()

    role_result = await db.execute(select(Role).where(Role.id == invite.roleId))
    role = role_result.scalar_one_or_none()

    access_token = create_access_token({
        "sub": user.id,
        "organizationId": invite.organizationId,
        "roleCode": role.code if role else None,
        "isPlatformAdmin": False,
    })
    return {"access_token": access_token, "token_type": "bearer"}
