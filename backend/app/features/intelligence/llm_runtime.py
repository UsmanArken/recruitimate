import json
import logging
from typing import Any, TypeVar

from app.core.config import LLMProvider, TranscriptionProvider, get_settings

logger = logging.getLogger(__name__)

T = TypeVar("T")


def _resolved_provider() -> LLMProvider | None:
    return get_settings().resolved_llm_provider


async def chat_json(system: str, user: str, fallback: T) -> T:
    """Call the configured LLM and parse the response as JSON. Returns fallback on any error."""
    provider = _resolved_provider()
    settings = get_settings()

    if provider is None:
        logger.warning("No LLM provider configured — returning fallback")
        return fallback

    try:
        if provider == LLMProvider.openai:
            return await _openai_chat_json(system, user, fallback, settings)
        elif provider == LLMProvider.anthropic:
            return await _anthropic_chat_json(system, user, fallback, settings)
        elif provider == LLMProvider.google:
            return await _google_chat_json(system, user, fallback, settings)
    except Exception as exc:
        logger.warning("LLM call failed, using fallback: %s", exc)

    return fallback


async def _openai_chat_json(system: str, user: str, fallback: T, settings) -> T:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    response = await client.chat.completions.create(
        model=settings.OPENAI_CHAT_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
    )
    text = response.choices[0].message.content or ""
    return _parse_json(text, fallback)


async def _anthropic_chat_json(system: str, user: str, fallback: T, settings) -> T:
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = await client.messages.create(
        model=settings.ANTHROPIC_CHAT_MODEL,
        max_tokens=4096,
        system=system + "\n\nRespond with valid JSON only.",
        messages=[{"role": "user", "content": user}],
    )
    text = response.content[0].text if response.content else ""
    return _parse_json(text, fallback)


async def _google_chat_json(system: str, user: str, fallback: T, settings) -> T:
    import google.generativeai as genai

    genai.configure(api_key=settings.GOOGLE_API_KEY)
    model = genai.GenerativeModel(
        settings.GOOGLE_CHAT_MODEL,
        system_instruction=system + "\n\nRespond with valid JSON only.",
        generation_config={"response_mime_type": "application/json"},
    )
    response = await model.generate_content_async(user)
    return _parse_json(response.text or "", fallback)


def _parse_json(text: str, fallback: T) -> T:
    text = text.strip()
    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]) if len(lines) > 2 else text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        logger.warning("Failed to parse LLM JSON response")
        return fallback


async def transcribe_audio(data: bytes, filename: str, mime_type: str) -> str:
    settings = get_settings()
    if settings.TRANSCRIPTION_PROVIDER != TranscriptionProvider.openai or not settings.OPENAI_API_KEY:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcription requires OPENAI_API_KEY and TRANSCRIPTION_PROVIDER=openai",
        )

    from openai import AsyncOpenAI
    import io

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    file_tuple = (filename, io.BytesIO(data), mime_type)
    response = await client.audio.transcriptions.create(
        model="whisper-1",
        file=file_tuple,
    )
    return response.text


def get_provider_status() -> dict[str, Any]:
    settings = get_settings()
    return {
        "configuredProvider": settings.LLM_PROVIDER,
        "resolvedProvider": settings.resolved_llm_provider,
        "openaiModel": settings.OPENAI_CHAT_MODEL if settings.OPENAI_API_KEY else None,
        "anthropicModel": settings.ANTHROPIC_CHAT_MODEL if settings.ANTHROPIC_API_KEY else None,
        "googleModel": settings.GOOGLE_CHAT_MODEL if settings.GOOGLE_API_KEY else None,
        "transcriptionProvider": settings.TRANSCRIPTION_PROVIDER,
    }
