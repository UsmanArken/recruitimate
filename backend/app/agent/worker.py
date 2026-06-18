import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def entrypoint(ctx: "JobContext"):
    from livekit.agents import AutoSubscribe, JobContext  # noqa: F401
    room_name = ctx.room.name
    logger.info("Agent joining room: %s", room_name)

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(room_name, "joined")

    # Register cleanup — called when the room closes
    async def on_shutdown():
        logger.info("Room closed: %s — marking finished", room_name)
        _after_room_end(room_name)

    ctx.add_shutdown_callback(on_shutdown)


def _after_room_end(room_name: str) -> None:
    """Mark interview finished. Egress/audio analysis added in Phase 2."""
    try:
        interview_id = _get_interview_id_by_room(room_name)
        if interview_id:
            from app.workers.tasks import process_interview_audio
            # No audio URL yet (egress is a paid LiveKit feature — Phase 2)
            process_interview_audio.delay(interview_id, "")
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
