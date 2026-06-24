"""Internal endpoints called by the agent process — no auth, localhost-only."""
from fastapi import APIRouter, HTTPException, Request

from app.core.dependencies import DB
from app.features.interviews import service
from app.features.interviews.schemas import SegmentRequest

internal_router = APIRouter(prefix="/internal/interviews", tags=["internal"], include_in_schema=False)


@internal_router.post("/{interview_id}/segment")
async def internal_segment(
    interview_id: str,
    body: SegmentRequest,
    request: Request,
    db: DB,
):
    client_host = request.client.host if request.client else ""
    if client_host not in ("127.0.0.1", "::1", "localhost"):
        raise HTTPException(status_code=403, detail="Internal endpoint")
    await service.write_segment(interview_id, body.speaker, body.text, body.timestampMs, db)
    return {"ok": True}
