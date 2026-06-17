from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.models import JobAssignment, RolePermission, Permission

PLATFORM_SUPER_ADMIN_ROLE_CODE = "PLATFORM_SUPER_ADMIN"
JOB_INTERVIEWER_ROLE_CODE = "JOB_INTERVIEWER"

# roleId → set of permission codes
_cache: dict[str, set[str]] = {}


def clear_permission_cache(role_id: str | None = None) -> None:
    if role_id:
        _cache.pop(role_id, None)
    else:
        _cache.clear()


async def _load_codes_for_role(role_id: str, db: AsyncSession) -> set[str]:
    if role_id in _cache:
        return _cache[role_id]

    result = await db.execute(
        select(Permission.code)
        .join(RolePermission, RolePermission.permissionId == Permission.id)
        .where(RolePermission.roleId == role_id)
    )
    codes = {row[0] for row in result.all()}
    _cache[role_id] = codes
    return codes


async def get_effective_codes(auth_ctx, job_id: str | None, db: AsyncSession) -> set[str]:
    from app.core.dependencies import AuthContext

    ctx: AuthContext = auth_ctx
    if not ctx.role_code:
        return set()

    # Get base role codes via role_code → look up role id
    from app.shared.models import Role
    role_result = await db.execute(select(Role).where(Role.code == ctx.role_code))
    role = role_result.scalar_one_or_none()
    base_codes: set[str] = set()
    if role:
        base_codes = await _load_codes_for_role(role.id, db)

    if not job_id:
        return base_codes

    # Check job-level assignment and merge JOB_INTERVIEWER permissions
    assignment_result = await db.execute(
        select(JobAssignment).where(
            JobAssignment.jobId == job_id,
            JobAssignment.userId == ctx.user_id,
        )
    )
    assignment = assignment_result.scalar_one_or_none()
    if not assignment:
        return base_codes

    from app.shared.models import Role as RoleModel
    job_role_result = await db.execute(
        select(RoleModel).where(RoleModel.code == JOB_INTERVIEWER_ROLE_CODE)
    )
    job_role = job_role_result.scalar_one_or_none()
    if job_role:
        job_codes = await _load_codes_for_role(job_role.id, db)
        return base_codes | job_codes

    return base_codes


async def has_permission(
    auth_ctx,
    resource: str,
    action: str,
    job_id: str | None = None,
    db: AsyncSession | None = None,
) -> bool:
    from app.core.dependencies import AuthContext

    ctx: AuthContext = auth_ctx
    if ctx.is_platform_admin:
        return True

    if db is None:
        return False

    codes = await get_effective_codes(ctx, job_id, db)

    candidates = {f"{resource}.{action}"}
    if action == "read":
        candidates.add(f"{resource}.read_all")
        candidates.add(f"{resource}.read_assigned")

    return bool(codes & candidates)


async def assert_permission(
    auth_ctx,
    resource: str,
    action: str,
    job_id: str | None = None,
    db: AsyncSession | None = None,
) -> None:
    from fastapi import HTTPException, status

    if not await has_permission(auth_ctx, resource, action, job_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
