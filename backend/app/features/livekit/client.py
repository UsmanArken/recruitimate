from livekit import api
from app.core.config import get_settings


def _lk_api() -> api.LiveKitAPI:
    settings = get_settings()
    return api.LiveKitAPI(
        url=settings.LIVEKIT_URL,
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )


async def create_room(room_name: str) -> None:
    async with _lk_api() as lk:
        await lk.room.create_room(
            api.CreateRoomRequest(name=room_name, empty_timeout=300, max_participants=10)
        )


def generate_token(
    room_name: str,
    participant_identity: str,
    participant_name: str,
    is_agent: bool = False,
) -> str:
    settings = get_settings()
    token = api.AccessToken(
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    grants = api.VideoGrants(
        room_join=True,
        room=room_name,
        can_publish=not is_agent,
        can_subscribe=True,
        hidden=is_agent,
        agent=is_agent,
    )
    token.with_identity(participant_identity).with_name(participant_name).with_grants(grants)
    return token.to_jwt()


async def trigger_egress(room_name: str, audio_output_key: str) -> str:
    settings = get_settings()
    async with _lk_api() as lk:
        resp = await lk.egress.start_room_composite_egress(
            api.RoomCompositeEgressRequest(
                room_name=room_name,
                audio_only=True,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.OGG,
                        filepath=audio_output_key,
                        s3=api.S3Upload(
                            access_key=settings.R2_ACCESS_KEY_ID,
                            secret=settings.R2_SECRET_ACCESS_KEY,
                            bucket=settings.R2_BUCKET_NAME,
                            endpoint=settings.R2_ENDPOINT_URL,
                            region="auto",
                            force_path_style=True,
                        ),
                    )
                ],
            )
        )
    return resp.egress_id


def build_candidate_join_url(token: str) -> str:
    settings = get_settings()
    return f"{settings.APP_URL}/interview/join?token={token}"
