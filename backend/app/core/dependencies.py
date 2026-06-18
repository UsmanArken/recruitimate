from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.core.database import AsyncSession, get_db

_bearer = HTTPBearer(auto_error=False)


class AuthContext:
    def __init__(self, payload: dict):
        self.user_id: str = payload["sub"]
        self.organization_id: str | None = payload.get("organizationId")
        self.role_code: str | None = payload.get("roleCode")
        self.is_platform_admin: bool = payload.get("isPlatformAdmin", False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> AuthContext:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    if "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    if payload.get("type") == "candidate":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Candidate token not accepted here")
    return AuthContext(payload)


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> AuthContext | None:
    if not credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        return AuthContext(payload)
    except ValueError:
        return None


def require_platform_admin(auth: Annotated[AuthContext, Depends(get_current_user)]) -> AuthContext:
    if not auth.is_platform_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Platform admin required")
    return auth


def make_permission_dep(resource: str, action: str, job_id_param: str | None = None):
    """Factory that returns a FastAPI dependency checking a specific permission."""
    from app.shared.permissions import has_permission

    async def _dep(
        auth: Annotated[AuthContext, Depends(get_current_user)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> AuthContext:
        allowed = await has_permission(auth, resource, action, db=db)
        if not allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
        return auth

    return _dep


# ---------------------------------------------------------------------------
# Candidate auth (cookie-based, separate namespace)
# ---------------------------------------------------------------------------


class CandidateAuthContext:
    def __init__(self, payload: dict):
        self.candidate_id: str = payload["sub"]


async def get_current_candidate(
    candidate_token: Annotated[str | None, Cookie(alias="candidate_token")] = None,
) -> CandidateAuthContext:
    if not candidate_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_access_token(candidate_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    if payload.get("type") != "candidate":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
    if "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    return CandidateAuthContext(payload)


# Common typed dependencies
CurrentUser = Annotated[AuthContext, Depends(get_current_user)]
OptionalUser = Annotated[AuthContext | None, Depends(get_current_user_optional)]
PlatformAdmin = Annotated[AuthContext, Depends(require_platform_admin)]
DB = Annotated[AsyncSession, Depends(get_db)]
CurrentCandidate = Annotated[CandidateAuthContext, Depends(get_current_candidate)]
