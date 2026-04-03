from pydantic_settings import BaseSettings, SettingsConfigDict

from typing import Optional

class Settings(BaseSettings):
    API_KEY: str = "sk_track2_987654321"
    GEMINI_API_KEY: str
    GROQ_API_KEY: str | None = None
    COHERE_API_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
