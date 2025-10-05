from pydantic_settings import BaseSettings
from typing import Optional, Literal

AuthMode = Literal["none", "apikey", "auth0"]

class Settings(BaseSettings):
    app_name: str = "Scheduling API"
    api_prefix: str = "/api"
    frontend_origin: Optional[str] = None
    log_level: str = "INFO"

    # Auth switch
    auth_mode: AuthMode = "apikey"
    admin_api_key: Optional[str] = None  # only used when AUTH_MODE=apikey

    # (for later, when you wire Auth0)
    auth0_domain: Optional[str] = None
    auth0_audience: Optional[str] = None
    auth0_issuer: Optional[str] = None

    # DB
    database_url: str = "sqlite+aiosqlite:///./data/app.db"

    class Config:
        env_file = ".env"

settings = Settings()
