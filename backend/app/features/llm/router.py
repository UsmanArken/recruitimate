from fastapi import APIRouter

from app.features.intelligence.llm_runtime import get_provider_status

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.get("/status")
async def llm_status():
    return get_provider_status()
