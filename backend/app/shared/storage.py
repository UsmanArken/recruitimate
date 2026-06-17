import os
from pathlib import Path

from fastapi import HTTPException, status

from app.core.config import get_settings

MAX_RECORDING_BYTES = 25 * 1024 * 1024  # 25 MB

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".mp4", ".mpeg", ".mpga"}
ALLOWED_MIME_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/m4a", "audio/x-m4a", "audio/webm", "video/webm",
    "video/mp4", "audio/mp4",
}


def _recordings_dir() -> Path:
    upload_dir = Path(get_settings().UPLOAD_DIR)
    recordings = upload_dir / "interviews"
    recordings.mkdir(parents=True, exist_ok=True)
    return recordings


def assert_recording_file(filename: str, content_type: str, size: int) -> None:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {ext} not allowed",
        )
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type {content_type} not allowed",
        )
    if size > MAX_RECORDING_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recording file exceeds 25 MB limit",
        )


def save_interview_recording(interview_id: str, data: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    dest = _recordings_dir() / f"{interview_id}{ext}"
    dest.write_bytes(data)
    return f"interviews/{interview_id}{ext}"


def read_interview_recording(relative_path: str) -> bytes:
    full_path = Path(get_settings().UPLOAD_DIR) / relative_path
    if not full_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recording not found")
    return full_path.read_bytes()


def absolute_recording_path(relative_path: str) -> str:
    return str(Path(get_settings().UPLOAD_DIR) / relative_path)
