from fastapi import APIRouter, Response, UploadFile
from app.core.dependencies import CurrentCandidate, DB
from app.features.candidate_portal import service
from app.features.candidate_portal.schemas import (
    CandidateLoginRequest,
    CandidateSignupRequest,
    CheckEmailRequest,
    UpdateCandidateMeRequest,
)

router = APIRouter(tags=["candidate_portal"])

_COOKIE_MAX_AGE = 30 * 24 * 60 * 60  # 30 days


def _set_candidate_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="candidate_token",
        value=token,
        max_age=_COOKIE_MAX_AGE,
        path="/",
        httponly=True,
        samesite="lax",
    )


# ---------------------------------------------------------------------------
# Public — no auth
# ---------------------------------------------------------------------------

@router.get("/api/apply/{token}")
async def get_apply_info(token: str, db: DB):
    return await service.get_apply_info(token, db)


@router.post("/api/apply/{token}/check-email")
async def check_email(token: str, body: CheckEmailRequest, db: DB):
    return await service.check_email(token, body.email, db)


@router.post("/api/apply/{token}/signup", status_code=201)
async def candidate_signup(token: str, body: CandidateSignupRequest, response: Response, db: DB):
    data = await service.candidate_signup(token, body, db)
    _set_candidate_cookie(response, data["access_token"])
    return data


@router.post("/api/candidate/auth/login")
async def candidate_login(body: CandidateLoginRequest, response: Response, db: DB):
    data = await service.candidate_login(body.email, body.password, db)
    _set_candidate_cookie(response, data["access_token"])
    return data


@router.post("/api/candidate/auth/logout")
async def candidate_logout(response: Response):
    response.delete_cookie("candidate_token", path="/")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Authenticated — requires candidate_token cookie
# ---------------------------------------------------------------------------

@router.get("/api/candidate/me")
async def get_me(auth: CurrentCandidate, db: DB):
    return await service.get_candidate_me(auth.candidate_id, db)


@router.patch("/api/candidate/me")
async def update_me(body: UpdateCandidateMeRequest, auth: CurrentCandidate, db: DB):
    return await service.update_candidate_me(auth.candidate_id, body, db)


@router.post("/api/candidate/me/resume")
async def reupload_resume(file: UploadFile, auth: CurrentCandidate, db: DB):
    return await service.reupload_resume(auth.candidate_id, file, db)


@router.get("/api/candidate/me/interviews")
async def get_my_interviews(auth: CurrentCandidate, db: DB):
    data = await service.get_candidate_me(auth.candidate_id, db)
    interviews = [iv for app in data["applications"] for iv in app["interviews"]]
    return {"interviews": interviews}
