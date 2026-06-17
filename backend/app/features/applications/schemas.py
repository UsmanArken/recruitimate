from pydantic import BaseModel


class UpdateStageRequest(BaseModel):
    stage: str


class LiveAssistRequest(BaseModel):
    currentQuestion: str
    currentAnswer: str | None = None
