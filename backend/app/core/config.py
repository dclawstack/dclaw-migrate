from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "DClaw Migrate"
    app_env: str = "dev"
    debug: bool = True

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dclaw_migrate"

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60

    # AI providers — OpenRouter primary, Ollama fallback
    openrouter_api_key: str = ""
    ollama_base_url: str = ""
    ollama_model: str = "llama3"

    # Logto auth — JWT validation (disabled when issuer is empty)
    logto_issuer: str = ""
    logto_audience: str = "dclaw-migrate"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
