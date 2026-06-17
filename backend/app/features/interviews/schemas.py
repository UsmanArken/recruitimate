from datetime import datetime
from pydantic import BaseModel


class CreateInterviewRequest(BaseModel):
    title: str
    scheduledAt: datetime | None = None
    durationMinutes: int = 60
    meetingUrl: str | None = None


class VideoMetricsConsentRequest(BaseModel):
    consentGranted: bool
    metricsData: dict | None = None
