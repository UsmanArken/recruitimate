from pydantic import BaseModel


class CreateCandidateRequest(BaseModel):
    name: str
    email: str | None = None
    jobId: str | None = None
    linkedInUrl: str | None = None
    linkedInText: str | None = None
    githubUrl: str | None = None
    portfolioUrl: str | None = None
    resumeText: str | None = None


class UpdateCandidateRequest(BaseModel):
    name: str | None = None
    email: str | None = None
    linkedInUrl: str | None = None
    githubUrl: str | None = None
    portfolioUrl: str | None = None
    resumeText: str | None = None
    marking: str | None = None  # ACTIVE|ON_HOLD|ARCHIVED


class CreateNoteRequest(BaseModel):
    content: str
    tags: list[str] | None = None


class UpdateNoteRequest(BaseModel):
    content: str | None = None
    tags: list[str] | None = None


class CreateApplicationRequest(BaseModel):
    jobId: str


class LinkedInRequest(BaseModel):
    profileText: str | None = None
    linkedInUrl: str | None = None


class UpdateStatusRequest(BaseModel):
    status: str
