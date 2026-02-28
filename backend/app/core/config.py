from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = Field(default="OMT Events API", alias="APP_NAME")
    env: str = Field(default="dev", alias="ENV")
    secret_key: str = Field(..., alias="SECRET_KEY") # Field(...) forces it to be provided (env or config)
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    database_url: str = Field(default="sqlite+aiosqlite:///./omt.db", alias="DATABASE_URL")
    cors_origins: str = Field(
        default="http://localhost:5500,http://127.0.0.1:5500,http://localhost:8001,http://127.0.0.1:8001",
        alias="CORS_ORIGINS"
    )

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
