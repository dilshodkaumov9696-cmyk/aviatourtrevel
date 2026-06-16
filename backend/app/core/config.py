from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "aviator_web"
    app_env: str = "development"
    app_debug: bool = True
    app_port: int = 8000

    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080

    database_url: str = "postgresql+asyncpg://aviator:aviator@localhost:5432/aviator_web"
    redis_url: str = "redis://localhost:6379/0"

    cors_origins: str = "http://localhost:3000"

    provider: str = "travelpayouts"
    travelpayouts_token: str = ""
    travelpayouts_marker: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
