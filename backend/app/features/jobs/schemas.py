from pydantic import BaseModel


class CreateJobRequest(BaseModel):
    title: str
    description: str | None = None
    requirements: str | None = None
    hiringManagerId: str | None = None


class UpdateJobRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    hiringManagerId: str | None = None


class CreateAssignmentRequest(BaseModel):
    userId: str
    assignmentRole: str  # HIRING_MANAGER | INTERVIEWER


class UpdateAssignmentRequest(BaseModel):
    assignmentRole: str
