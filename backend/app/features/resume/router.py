from fastapi import APIRouter, UploadFile

from app.core.dependencies import CurrentUser
from app.features.intelligence.document_parser import extract_text

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume(file: UploadFile, auth: CurrentUser):
    data = await file.read()
    filename = file.filename or "resume"
    text = extract_text(data, filename)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "txt"
    return {
        "text": text,
        "fileName": filename,
        "format": ext,
        "characterCount": len(text),
    }
