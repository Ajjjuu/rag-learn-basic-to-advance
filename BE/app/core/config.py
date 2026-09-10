"""Application settings loaded from the .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Learning Backend"
    database_url: str = "sqlite:///./app.db"
    backend_port: int = 8420
    # Comma-separated string in .env, split into a list below.
    cors_origins: str = "http://localhost:5420"
    gemini_api_key: str = ""
    groq_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
