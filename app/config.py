from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Scheduling API"
    api_prefix: str = "/api"
    frontend_origin: str | None = None
    log_level: str = "INFO"
    api_key: str | None = None
    # Local default writes to /app/data/app.db (works in Docker)
    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    class Config:
        env_file = ".env"

settings = Settings()
