from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DB
from app.features.auth import service
from app.features.auth.schemas import LoginRequest, SignupRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: DB):
    return await service.login(body.email, body.password, db)


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(body: SignupRequest, db: DB):
    return await service.signup(body.email, body.password, body.name, body.organizationName, db)


@router.get("/me", response_model=UserResponse)
async def me(auth: CurrentUser, db: DB):
    return await service.get_me(auth.user_id, auth.organization_id, auth.role_code, auth.is_platform_admin, db)
