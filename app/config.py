from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = Field("Scheduling API", alias="APP_NAME")
    app_env: str = Field("dev", alias="APP_ENV")
    api_prefix: str = Field("/api", alias="API_PREFIX")
    frontend_origin: str = Field("http://localhost:5173", alias="FRONTEND_ORIGIN")
    log_level: str = Field("INFO", alias="LOG_LEVEL")


    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()