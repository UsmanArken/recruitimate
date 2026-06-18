from datetime import datetime, timezone
from pydantic import BaseModel, field_validator


class CreateInterviewRequest(BaseModel):
    title: str
    scheduledAt: datetime | None = None
    durationMinutes: int = 60
    meetingUrl: str | None = None

    @field_validator("scheduledAt", mode="before")
    @classmethod
    def strip_timezone(cls, v: datetime | None) -> datetime | None:
        if v is None:
            return v
        if isinstance(v, str):
            v = datetime.fromisoformat(v)
        # Convert to UTC then strip tzinfo so it matches TIMESTAMP WITHOUT TIME ZONE
        if v.tzinfo is not None:
            v = v.astimezone(timezone.utc).replace(tzinfo=None)
        return v
