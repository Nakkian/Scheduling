from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Scheduling API"
    api_prefix: str = "/api"
    frontend_origin: str | None = None
    log_level: str = "INFO"

    # Auth
    jwt_secret: str = "CHANGE_ME"           # set in Render env
    jwt_issuer: str = "scheduling-api"
    jwt_audience: str = "scheduling-web"
    jwt_minutes: int = 60 * 12              # 12h sessions

    # Demo user/passwords (env for now; replace with real IdP later)
    viewer_user: str | None = None
    viewer_pass_hash: str | None = None     # bcrypt hash
    editor_user: str | None = None
    editor_pass_hash: str | None = None
    admin_user: str | None = None
    admin_pass_hash: str | None = None

    class Config:
        env_file = ".env"

settings = Settings()
