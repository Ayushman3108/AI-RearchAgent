import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings management utilizing Pydantic Settings.
    Automatically loads variables from the environment or a .env file.
    """
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    DEBUG: bool = False

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Allow configuration via environment variables or fallback .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


# Instantiate a singleton settings object for application-wide reuse
settings = Settings()


class Config:
    """Compatibility wrapper for the existing app configuration interface."""
    GEMINI_API_KEY: str = settings.GEMINI_API_KEY or ""
    MODEL_NAME: str = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")
    TEMPERATURE: float = 0.2
    MAX_OUTPUT_TOKENS: int = 4000

    ALLOWED_ORIGINS: list = [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]


config = Config()