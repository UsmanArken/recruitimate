from fastapi import APIRouter, UploadFile

from app.features.intelligence.document_parser import extract_text
from app.features.intelligence.engines import extract_resume_identity

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/parse")
async def parse_resume(file: UploadFile):
    data = await file.read()
    filename = file.filename or "resume"
    text = extract_text(data, filename)
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "txt"
    identity = await extract_resume_identity(text)
    return {
        "text": text,
        "fileName": filename,
        "format": ext,
        "characterCount": len(text),
        "name": identity.get("name"),
        "email": identity.get("email"),
    }
