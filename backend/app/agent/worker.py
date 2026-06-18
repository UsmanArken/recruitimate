import asyncio
import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def entrypoint(ctx: "JobContext"):
    """Called when the agent is assigned to a LiveKit room."""
    from livekit.agents import AutoSubscribe, JobContext  # noqa: F401
    room_name = ctx.room.name
    logger.info("Agent joining room: %s", room_name)

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(room_name, "joined")

    # Start egress while room is still active — LiveKit stops it automatically when the room closes.
    egress_id = await _start_egress(room_name)

    await ctx.wait_for_disconnect()

    logger.info("Room ended: %s", room_name)
    if egress_id:
        await _after_room_end(room_name)


async def _start_egress(room_name: str) -> str | None:
    """Start composite egress while the room is live. Returns egress_id or None on failure."""
    from app.features.livekit.client import trigger_egress

    audio_key = f"interviews/{room_name}.ogg"
    try:
        egress_id = await trigger_egress(room_name, audio_key)
        logger.info("Egress started: %s for room %s", egress_id, room_name)
        return egress_id
    except Exception:
        logger.exception("Failed to start egress for room %s", room_name)
        _update_agent_status(room_name, "failed")
        return None


async def _after_room_end(room_name: str) -> None:
    """After the room closes, enqueue the audio processing task."""
    from app.core.config import get_settings

    settings = get_settings()
    audio_key = f"interviews/{room_name}.ogg"
    audio_url = f"r2://{settings.R2_BUCKET_NAME}/{audio_key}"

    try:
        interview_id = _get_interview_id_by_room(room_name)
        if interview_id:
            from app.workers.tasks import process_interview_audio
            process_interview_audio.delay(interview_id, audio_url)
            logger.info("Enqueued process_interview_audio for interview %s", interview_id)

        _update_agent_status(room_name, "finished")
    except Exception:
        logger.exception("Post-room cleanup failed for %s", room_name)
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
