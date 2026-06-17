from fastapi import APIRouter, Response, UploadFile

from app.core.dependencies import CurrentUser, DB
from app.features.interviews import service
from app.features.interviews.schemas import CreateInterviewRequest, VideoMetricsConsentRequest

router = APIRouter(
    prefix="/api/applications/{application_id}/interviews",
    tags=["interviews"],
)


@router.get("")
async def list_interviews(application_id: str, auth: CurrentUser, db: DB):
    return await service.list_interviews(application_id, auth.organization_id, db)


@router.post("", status_code=201)
async def create_interview(application_id: str, body: CreateInterviewRequest, auth: CurrentUser, db: DB):
    return await service.create_interview(application_id, auth.organization_id, body.model_dump(exclude_none=True), db)


@router.post("/{interview_id}/analyze")
async def analyze(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.analyze_interview(interview_id, application_id, auth.organization_id, db)


@router.post("/{interview_id}/transcribe")
async def transcribe(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.transcribe_interview(interview_id, application_id, auth.organization_id, db)


@router.post("/{interview_id}/recording")
async def upload_recording(application_id: str, interview_id: str, file: UploadFile, auth: CurrentUser, db: DB):
    data = await file.read()
    return await service.upload_recording(
        interview_id, application_id, auth.organization_id,
        data, file.filename or "recording", file.content_type or "audio/webm", db
    )


@router.get("/{interview_id}/recording")
async def get_recording(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    data, mime = await service.get_recording(interview_id, application_id, auth.organization_id, db)
    return Response(content=data, media_type=mime)


@router.post("/{interview_id}/calendar")
async def calendar(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    ics_data = await service.generate_calendar(interview_id, application_id, auth.organization_id, db)
    return Response(content=ics_data, media_type="text/calendar")


@router.post("/{interview_id}/audio-signals")
async def audio_signals(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.extract_audio_signals(interview_id, application_id, auth.organization_id, db)


@router.post("/{interview_id}/video-metrics")
async def video_metrics(application_id: str, interview_id: str, body: VideoMetricsConsentRequest, auth: CurrentUser, db: DB):
    return await service.store_video_metrics(
        interview_id, application_id, auth.organization_id,
        body.consentGranted, body.metricsData, db
    )
