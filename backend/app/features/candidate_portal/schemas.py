from pydantic import BaseModel, EmailStr


class CandidateSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    resumeText: str | None = None
    linkedInUrl: str | None = None
    githubUrl: str | None = None


class CandidateLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateCandidateMeRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    githubUrl: str | None = None
    linkedInUrl: str | None = None
