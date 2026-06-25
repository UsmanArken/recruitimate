from enum import Enum
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMProvider(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    google = "google"
    auto = "auto"


class AppEnv(str, Enum):
    development = "development"
    production = "production"
    test = "test"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str

    # Auth
    AUTH_SECRET: str
    AUTH_URL: str = "http://localhost:8000"

    # LLM
    LLM_PROVIDER: LLMProvider = LLMProvider.auto
    OPENAI_API_KEY: str = ""
    OPENAI_CHAT_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_CHAT_MODEL: str = "claude-3-5-haiku-latest"
    GOOGLE_API_KEY: str = ""
    GOOGLE_CHAT_MODEL: str = "gemini-1.5-flash"
    GOOGLE_AUDIO_MODEL: str = "gemini-2.0-flash"

    # Storage
    UPLOAD_DIR: str = "./uploads"

    # Celery / Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Deepgram
    DEEPGRAM_API_KEY: str = ""

    # LiveKit
    LIVEKIT_URL: str = "wss://your-project.livekit.cloud"
    LIVEKIT_API_KEY: str = ""
    LIVEKIT_API_SECRET: str = ""

    # Cloudflare R2 (S3-compatible audio storage)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "recruitimate-audio"
    R2_ENDPOINT_URL: str = ""  # https://<account_id>.r2.cloudflarestorage.com

    # Internal API URL — used by the LiveKit agent to post transcript segments.
    # In Docker Compose this should be http://api:8000; on a single host it stays localhost.
    INTERNAL_API_URL: str = "http://localhost:8000"

    # Frontend URL (used for building join links)
    APP_URL: str = "http://localhost:3000"

    # Platform admin
    SUPER_ADMIN_EMAIL: str = "admin@recruitimate.local"
    SUPER_ADMIN_PASSWORD: str = ""

    # Environment
    APP_ENV: AppEnv = AppEnv.development

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == AppEnv.production

    @property
    def resolved_llm_provider(self) -> LLMProvider | None:
        if self.LLM_PROVIDER != LLMProvider.auto:
            return self.LLM_PROVIDER
        if self.OPENAI_API_KEY:
            return LLMProvider.openai
        if self.ANTHROPIC_API_KEY:
            return LLMProvider.anthropic
        if self.GOOGLE_API_KEY:
            return LLMProvider.google
        return None


@lru_cache
def get_settings() -> Settings:
    return Settings()
