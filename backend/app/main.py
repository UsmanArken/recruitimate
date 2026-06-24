import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import get_session_factory
from app.features.admin.router import router as admin_router
from app.features.candidate_portal.router import router as candidate_portal_router
from app.features.applications.router import router as applications_router
from app.features.auth.router import router as auth_router
from app.features.candidates.router import router as candidates_router
from app.features.clients.router import router as clients_router
from app.features.interviews.router import router as interviews_router
from app.features.interviews.internal_router import internal_router
from app.features.invites.router import router as invites_router
from app.features.jobs.router import router as jobs_router
from app.features.linkedin.router import router as linkedin_router
from app.features.llm.router import router as llm_router
from app.features.resume.router import router as resume_router
from app.features.roles.router import router as roles_router
from app.shared.models import Role, RoleScope

SEED_ROLES = [
    {"code": "ORG_ADMIN",       "name": "Admin",           "scope": RoleScope.ORGANIZATION},
    {"code": "RECRUITER",       "name": "Recruiter",       "scope": RoleScope.ORGANIZATION},
    {"code": "HIRING_MANAGER",  "name": "Hiring Manager",  "scope": RoleScope.ORGANIZATION},
    {"code": "INTERVIEWER",     "name": "Interviewer",     "scope": RoleScope.JOB},
]


async def _seed_roles() -> None:
    async with get_session_factory()() as db:
        for r in SEED_ROLES:
            exists = await db.execute(select(Role).where(Role.code == r["code"]))
            if not exists.scalar_one_or_none():
                db.add(Role(code=r["code"], name=r["name"], scope=r["scope"]))
        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _seed_roles()
    yield


app = FastAPI(
    title="Recruitimate API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.AUTH_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(invites_router)
app.include_router(candidates_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(interviews_router)
app.include_router(resume_router)
app.include_router(linkedin_router)
app.include_router(llm_router)
app.include_router(admin_router)
app.include_router(roles_router)
app.include_router(candidate_portal_router)
app.include_router(internal_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
