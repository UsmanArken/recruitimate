from fastapi import APIRouter, Response, UploadFile
from app.core.dependencies import CurrentCandidate, DB
from app.features.candidate_portal import service
from app.features.candidate_portal.schemas import (
    CandidateLoginRequest,
    CandidateSignupRequest,
    UpdateCandidateMeRequest,
)

router = APIRouter(tags=["candidate_portal"])


# ---------------------------------------------------------------------------
# Public — no auth
# ---------------------------------------------------------------------------

@router.get("/api/apply/{token}")
async def get_apply_info(token: str, db: DB):
    return await service.get_apply_info(token, db)


@router.post("/api/apply/{token}/signup", status_code=201)
async def candidate_signup(token: str, body: CandidateSignupRequest, db: DB):
    return await service.candidate_signup(token, body, db)


@router.post("/api/candidate/auth/login")
async def candidate_login(body: CandidateLoginRequest, db: DB):
    return await service.candidate_login(body.email, body.password, db)


@router.post("/api/candidate/auth/logout")
async def candidate_logout(response: Response):
    response.delete_cookie("candidate_token")
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
    return {"interviews": data["interviews"]}
