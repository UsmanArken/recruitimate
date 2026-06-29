import asyncio
import logging
import os
import tempfile
import time
import wave

from app.core.config import get_settings

logger = logging.getLogger(__name__)

logging.getLogger("websockets").setLevel(logging.WARNING)
logging.getLogger("deepgram").setLevel(logging.WARNING)

# {room_name: {tasks, wav_files, dg_conns, start_ms, interview_id}}
_room_state: dict = {}


async def entrypoint(ctx: "JobContext"):
    from livekit.agents import AutoSubscribe, JobContext  # noqa: F401

    room_name = ctx.room.name
    logger.info("Agent joining room: %s", room_name)

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    _update_agent_status(room_name, "joined")

    _room_state[room_name] = {
        "tasks": [],
        "wav_files": {},      # speaker -> (file_path, wave.Wave_write)
        "dg_conns": {},       # speaker -> Deepgram connection
        "start_ms": int(time.time() * 1000),
        "interview_id": _get_interview_id_by_room(room_name),
        "shutting_down": False,
    }

    @ctx.room.on("track_subscribed")
    def on_track(track, publication, participant):
        from livekit.rtc import TrackKind
        if track.kind != TrackKind.KIND_AUDIO:
            return

        identity = participant.identity or ""
        if "candidate" in identity:
            speaker = "candidate"
        elif "recruiter" in identity:
            speaker = "recruiter"
        else:
            return

        state = _room_state.get(room_name)
        if not state:
            return

        # Open temp WAV file for this speaker
        tmp = tempfile.NamedTemporaryFile(
            suffix=f"_{speaker}.wav", delete=False, dir=tempfile.gettempdir()
        )
        wf = wave.open(tmp.name, "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)   # int16
        wf.setframerate(16000)
        state["wav_files"][speaker] = (tmp.name, wf)
        tmp.close()

        t = asyncio.create_task(_process_track(track, speaker, state))
        state["tasks"].append(t)

    async def on_shutdown():
        await _flush_and_upload(room_name)

    ctx.add_shutdown_callback(on_shutdown)


async def _process_track(track, speaker: str, state: dict):
    """Single loop per track: sends audio to Deepgram AND writes WAV.
    WAV writes are offloaded to a thread executor to avoid blocking the event loop.
    Deepgram connection is automatically re-established if it drops mid-call."""
    from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents
    from livekit.rtc import AudioStream
    import httpx

    settings = get_settings()
    loop = asyncio.get_event_loop()

    RECONNECT_BACKOFF = 1.5  # seconds to wait before reconnecting

    async def on_transcript(self_ref, result, **kwargs):
        try:
            sentence = result.channel.alternatives[0].transcript
            if result.is_final and sentence.strip():
                elapsed_ms = int(time.time() * 1000) - state["start_ms"]
                interview_id = state.get("interview_id")
                if interview_id:
                    try:
                        async with httpx.AsyncClient() as client:
                            await client.post(
                                f"http://localhost:8000/internal/interviews/{interview_id}/segment",
                                json={"speaker": speaker, "text": sentence, "timestampMs": elapsed_ms},
                                timeout=5.0,
                            )
                    except Exception:
                        logger.warning("Failed to POST segment for interview %s", interview_id)
        except Exception:
            logger.exception("Transcript callback error for %s", speaker)

    def _write_wav(wf, data: bytes) -> None:
        wf.writeframes(data)

    audio_stream = AudioStream(track, sample_rate=16000, num_channels=1)

    if not settings.DEEPGRAM_API_KEY:
        logger.warning("DEEPGRAM_API_KEY not set — skipping transcription for %s", speaker)
        async for event in audio_stream:
            wav_entry = state["wav_files"].get(speaker)
            if wav_entry:
                _, wf = wav_entry
                try:
                    await loop.run_in_executor(None, _write_wav, wf, bytes(event.frame.data))
                except Exception:
                    logger.warning("WAV write error for speaker %s", speaker)
        return

    dg = DeepgramClient(settings.DEEPGRAM_API_KEY)
    opts = LiveOptions(
        model="nova-2",
        language="en-US",
        smart_format=True,
        interim_results=False,
        endpointing=300,
        encoding="linear16",
        sample_rate=16000,
        channels=1,
    )

    # Buffer incoming audio frames so we never lose frames during a reconnect window
    frame_queue: asyncio.Queue = asyncio.Queue()

    async def _feed_queue():
        try:
            async for event in audio_stream:
                await frame_queue.put(bytes(event.frame.data))
        except Exception:
            logger.warning("Audio stream error for %s — feed task exiting", speaker)
        finally:
            await frame_queue.put(None)  # sentinel — always signal end, even on error

    feed_task = asyncio.create_task(_feed_queue())

    conn = None
    try:
        while not state.get("shutting_down"):
            # (Re)connect to Deepgram
            conn = dg.listen.asyncwebsocket.v("1")
            conn.on(LiveTranscriptionEvents.Transcript, on_transcript)

            try:
                started = await conn.start(opts)
            except Exception as exc:
                logger.warning("Deepgram start() raised for %s (%s), retrying in %.1fs", speaker, exc, RECONNECT_BACKOFF)
                conn = None
                await asyncio.sleep(RECONNECT_BACKOFF)
                continue

            if not started:
                logger.warning("Deepgram connection failed for %s, retrying in %.1fs", speaker, RECONNECT_BACKOFF)
                conn = None
                await asyncio.sleep(RECONNECT_BACKOFF)
                continue

            state["dg_conns"][speaker] = conn
            logger.info("Deepgram connected for %s", speaker)

            try:
                while not state.get("shutting_down"):
                    try:
                        raw = await asyncio.wait_for(frame_queue.get(), timeout=5.0)
                    except asyncio.TimeoutError:
                        continue

                    if raw is None:
                        # Audio stream ended (cleanly or via error) — exit reconnect loop
                        return

                    # Send to Deepgram — send() returns False on connection failure (SDK swallows the exception)
                    ok = await conn.send(raw)
                    if not ok:
                        raise ConnectionError("Deepgram send() returned False — connection lost")

                    # Write to WAV
                    wav_entry = state["wav_files"].get(speaker)
                    if wav_entry:
                        _, wf = wav_entry
                        try:
                            await loop.run_in_executor(None, _write_wav, wf, raw)
                        except Exception:
                            logger.warning("WAV write error for speaker %s", speaker)

            except Exception as exc:
                logger.warning("Deepgram connection lost for %s (%s), reconnecting in %.1fs", speaker, exc, RECONNECT_BACKOFF)
                try:
                    await conn.finish()
                except Exception:
                    pass
                conn = None
                state["dg_conns"].pop(speaker, None)
                await asyncio.sleep(RECONNECT_BACKOFF)
                # Loop continues — reconnects at top of while
    finally:
        feed_task.cancel()
        if conn is not None:
            try:
                await conn.finish()
            except Exception:
                pass


async def _flush_and_upload(room_name: str):
    import boto3

    state = _room_state.pop(room_name, None)
    if not state:
        return

    interview_id = state.get("interview_id")
    settings = get_settings()

    # Signal reconnect loops to stop before closing connections
    state["shutting_down"] = True

    # Close Deepgram connections first — lets them send a clean close frame
    # before we cancel the audio loops (which would otherwise trigger 1011)
    for conn in state.get("dg_conns", {}).values():
        try:
            await conn.finish()
        except Exception:
            pass

    for task in state.get("tasks", []):
        if not task.done():
            task.cancel()

    audio_urls: dict[str, str] = {}
    for speaker, (file_path, wf) in state.get("wav_files", {}).items():
        try:
            wf.close()
            if not interview_id:
                os.unlink(file_path)
                continue
            key = f"interviews/{interview_id}/{speaker}.wav"
            s3 = boto3.client(
                "s3",
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto",
            )
            s3.upload_file(file_path, settings.R2_BUCKET_NAME, key)
            audio_urls[speaker] = f"r2://{settings.R2_BUCKET_NAME}/{key}"
            os.unlink(file_path)
            logger.info("Uploaded %s audio to R2: %s", speaker, key)
        except Exception:
            logger.exception("Failed to upload %s audio", speaker)

    full_transcript = _assemble_transcript(interview_id) if interview_id else ""
    _finalize_interview(
        interview_id=interview_id,
        transcript=full_transcript,
        audio_url=audio_urls.get("candidate", ""),
    )

    if interview_id and audio_urls.get("candidate"):
        try:
            from app.workers.tasks import process_interview_audio
            process_interview_audio.delay(interview_id, audio_urls["candidate"])
        except Exception:
            logger.exception("Failed to enqueue process_interview_audio")

    _update_agent_status(room_name, "finished")


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


def _assemble_transcript(interview_id: str) -> str:
    from app.core.database import get_sync_session_factory
    from app.shared.models import LiveTranscriptSegment
    from sqlalchemy import select

    Session = get_sync_session_factory()
    with Session() as db:
        result = db.execute(
            select(LiveTranscriptSegment)
            .where(LiveTranscriptSegment.interviewId == interview_id)
            .order_by(LiveTranscriptSegment.timestampMs)
        )
        segments = result.scalars().all()
        lines = [f"{s.speaker.capitalize()}: {s.text}" for s in segments]
        return "\n".join(lines)


def _finalize_interview(interview_id: str | None, transcript: str, audio_url: str) -> None:
    if not interview_id:
        return
    from app.core.database import get_sync_session_factory
    from app.shared.models import Interview, InterviewStatus
    from sqlalchemy import select

    Session = get_sync_session_factory()
    with Session() as db:
        result = db.execute(select(Interview).where(Interview.id == interview_id))
        interview = result.scalar_one_or_none()
        if interview:
            if transcript:
                interview.transcript = transcript
            if audio_url:
                interview.audioUrl = audio_url
            interview.status = InterviewStatus.COMPLETED
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
