from fastapi import APIRouter, UploadFile

from app.core.dependencies import CurrentUser
from app.features.intelligence.document_parser import extract_text

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume(file: UploadFile, auth: CurrentUser):
    data = await file.read()
    text = extract_text(data, file.filename or "resume")
    return {"text": text, "filename": file.filename}
