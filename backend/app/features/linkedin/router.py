from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies import CurrentUser
from app.features.intelligence.llm_runtime import chat_json

router = APIRouter(prefix="/api/linkedin", tags=["linkedin"])

_FALLBACK = {
    "name": None,
    "headline": None,
    "summary": None,
    "skills": [],
    "experience": [],
    "education": [],
}


class LinkedInParseRequest(BaseModel):
    profileText: str


@router.post("/parse")
async def parse_linkedin(body: LinkedInParseRequest, auth: CurrentUser):
    system = (
        "You are a LinkedIn profile parser. Extract structured data from the profile text. "
        "Return JSON with: name, headline, summary, skills (string[]), "
        "experience (object[]), education (object[])."
    )
    result = await chat_json(system, body.profileText, _FALLBACK)
    return result
