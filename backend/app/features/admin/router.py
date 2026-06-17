from fastapi import APIRouter
from sqlalchemy import func, select

from app.core.dependencies import DB, PlatformAdmin
from app.shared.models import Job, JobApplication, Organization, OrganizationMember

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/organizations")
async def list_organizations(auth: PlatformAdmin, db: DB):
    result = await db.execute(select(Organization))
    orgs = result.scalars().all()

    out = []
    for org in orgs:
        member_count = await db.scalar(
            select(func.count()).where(OrganizationMember.organizationId == org.id)
        )
        job_count = await db.scalar(
            select(func.count()).where(Job.organizationId == org.id)
        )
        app_count = await db.scalar(
            select(func.count()).where(JobApplication.organizationId == org.id)
        )
        out.append({
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "createdAt": org.createdAt,
            "memberCount": member_count or 0,
            "jobCount": job_count or 0,
            "applicationCount": app_count or 0,
        })
    return out
