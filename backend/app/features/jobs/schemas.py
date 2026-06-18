from pydantic import BaseModel


class CreateJobRequest(BaseModel):
    title: str
    description: str | None = None
    requirements: str | None = None
    hiringManagerId: str | None = None
    interviewMode: str = "live"
    autoInterviewThreshold: int = 60


class UpdateJobRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: str | None = None
    hiringManagerId: str | None = None
    interviewMode: str | None = None
    autoInterviewThreshold: int | None = None


class CreateAssignmentRequest(BaseModel):
    userId: str
    assignmentRole: str  # HIRING_MANAGER | INTERVIEWER


class UpdateAssignmentRequest(BaseModel):
    assignmentRole: str
