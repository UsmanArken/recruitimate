import re

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import HiringClient, Job


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug.strip("-")


def _serialize_client(client: HiringClient, job_count: int = 0) -> dict:
    return {
        "id": client.id,
        "organizationId": client.organizationId,
        "name": client.name,
        "slug": client.slug,
        "website": client.website,
        "companyProfile": client.companyProfile,
        "impressionNotes": client.impressionNotes,
        "webDataConsentAt": client.webDataConsentAt,
        "jobCount": job_count,
        "createdAt": client.createdAt,
        "updatedAt": client.updatedAt,
    }


async def list_clients(org_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(HiringClient).where(HiringClient.organizationId == org_id)
    )
    clients = result.scalars().all()
    out = []
    for client in clients:
        count = await db.scalar(
            select(func.count()).where(Job.hiringClientId == client.id)
        ) or 0
        out.append(_serialize_client(client, count))
    return out


async def create_client(org_id: str, data: dict, db: AsyncSession) -> dict:
    base_slug = _slugify(data["name"])
    slug = base_slug
    # Ensure uniqueness within org
    counter = 1
    while True:
        existing = await db.scalar(
            select(HiringClient).where(
                HiringClient.organizationId == org_id,
                HiringClient.slug == slug,
            )
        )
        if not existing:
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    client = HiringClient(organizationId=org_id, slug=slug, **data)
    db.add(client)
    await db.flush()
    return _serialize_client(client)


async def get_client(client_id: str, org_id: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(HiringClient).where(
            HiringClient.id == client_id,
            HiringClient.organizationId == org_id,
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    count = await db.scalar(
        select(func.count()).where(Job.hiringClientId == client.id)
    ) or 0
    return _serialize_client(client, count)


async def update_client(client_id: str, org_id: str, data: dict, db: AsyncSession) -> dict:
    result = await db.execute(
        select(HiringClient).where(
            HiringClient.id == client_id,
            HiringClient.organizationId == org_id,
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    for k, v in data.items():
        setattr(client, k, v)
    await db.flush()
    count = await db.scalar(
        select(func.count()).where(Job.hiringClientId == client.id)
    ) or 0
    return _serialize_client(client, count)


async def delete_client(client_id: str, org_id: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(HiringClient).where(
            HiringClient.id == client_id,
            HiringClient.organizationId == org_id,
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    job_count = await db.scalar(
        select(func.count()).where(Job.hiringClientId == client.id)
    ) or 0
    if job_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete client with {job_count} active job(s). Reassign or delete those jobs first.",
        )
    await db.delete(client)
    await db.commit()


async def generate_job_draft(client_id: str, org_id: str, title: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(HiringClient).where(
            HiringClient.id == client_id,
            HiringClient.organizationId == org_id,
        )
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")

    from app.features.intelligence.engines import run_job_draft_intelligence
    return await run_job_draft_intelligence(client, title)
