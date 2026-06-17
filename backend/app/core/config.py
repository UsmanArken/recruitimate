from enum import Enum
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class LLMProvider(str, Enum):
    openai = "openai"
    anthropic = "anthropic"
    google = "google"
    auto = "auto"


class TranscriptionProvider(str, Enum):
    openai = "openai"
    none = "none"


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

    # Transcription
    TRANSCRIPTION_PROVIDER: TranscriptionProvider = TranscriptionProvider.none

    # Storage
    UPLOAD_DIR: str = "./uploads"

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
