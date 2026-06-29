from fastapi import APIRouter, Response

from app.core.dependencies import CurrentUser, DB
from app.features.interviews import service
from app.features.interviews.schemas import CreateInterviewRequest
from app.shared.permissions import require_role, ORG_ADMIN, ORG_OWNER, RECRUITER

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


@router.get("/{interview_id}/token")
async def get_token(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.get_interview_token(
        interview_id=interview_id,
        app_id=application_id,
        org_id=auth.organization_id,
        user_identity=f"recruiter-{auth.user_id}",
        user_name="Recruiter",
        db=db,
    )


@router.post("/{interview_id}/analyze")
async def analyze(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    require_role(auth, RECRUITER, ORG_ADMIN, ORG_OWNER)
    return await service.analyze_interview(interview_id, application_id, auth.organization_id, db)


@router.post("/{interview_id}/calendar")
async def calendar(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    ics_data = await service.generate_calendar(interview_id, application_id, auth.organization_id, db)
    return Response(content=ics_data, media_type="text/calendar")


@router.get("/{interview_id}/transcript-live")
async def transcript_live(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.get_live_transcript(interview_id, application_id, auth.organization_id, db)


@router.post("/{interview_id}/suggest")
async def suggest(application_id: str, interview_id: str, auth: CurrentUser, db: DB):
    return await service.suggest_followup(interview_id, application_id, auth.organization_id, db)
