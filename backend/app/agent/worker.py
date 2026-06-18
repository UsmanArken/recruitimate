import asyncio
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def entrypoint(ctx):
    """Called when the agent is assigned to a LiveKit room."""
    room_name = ctx.room.name
    logger.info("Agent joining room: %s", room_name)

    from livekit.agents import AutoSubscribe
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(room_name, "joined")

    # Wait until all participants leave and the room closes
    await ctx.wait_for_disconnect()

    logger.info("Room ended: %s — triggering egress", room_name)
    await _on_room_end(room_name)


async def _on_room_end(room_name: str) -> None:
    from app.features.livekit.client import trigger_egress
    from app.core.config import get_settings

    settings = get_settings()
    audio_key = f"interviews/{room_name}.ogg"
    try:
        await trigger_egress(room_name, audio_key)
        audio_url = f"r2://{settings.R2_BUCKET_NAME}/{audio_key}"

        interview_id = _get_interview_id_by_room(room_name)
        if interview_id:
            from app.workers.tasks import process_interview_audio
            process_interview_audio.delay(interview_id, audio_url)
            logger.info("Enqueued process_interview_audio for interview %s", interview_id)

        _update_agent_status(room_name, "finished")
    except Exception:
        logger.exception("Egress failed for room %s", room_name)
        _update_agent_status(room_name, "failed")


def _get_interview_id_by_room(room_name: str) -> str | None:
    from app.core.database import get_sync_session_factory
    from app.shared.models import Interview
    from sqlalchemy import select

    Session = get_sync_session_factory()
    with Session() as db:
        result = db.execute(select(Interview).where(Interview.livekitRoomName == room_name))
        interview = result.scalar_one_or_none()
        return interview.id if interview else None


def _update_agent_status(room_name: str, agent_status: str) -> None:
    from app.core.database import get_sync_session_factory
    from app.shared.models import Interview
    from sqlalchemy import select

    Session = get_sync_session_factory()
    with Session() as db:
        result = db.execute(select(Interview).where(Interview.livekitRoomName == room_name))
        interview = result.scalar_one_or_none()
        if interview:
            interview.agentStatus = agent_status
            db.commit()


if __name__ == "__main__":
    from livekit.agents import WorkerOptions, cli

    settings = get_settings()
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
            ws_url=settings.LIVEKIT_URL,
        )
    )
