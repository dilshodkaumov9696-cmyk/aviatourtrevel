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

    # Ключ для менеджерских ручек (смена статуса заявки), пока нет ролей
    # пользователей и полноценного бэк-офиса. Пусто по умолчанию — и тогда
    # ручка отвечает 503, а не пускает всех подряд.
    manager_api_key: str = ""

    # Вход через Google. Пока клиент не настроен, email+пароль работает как
    # обычно — кнопка Google просто вернёт понятную ошибку вместо падения.
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"

    database_url: str = "postgresql+asyncpg://aviator:aviator@localhost:5433/aviator_web"
    redis_url: str = "redis://localhost:6379/0"

    cors_origins: str = "http://localhost:3000"

    provider: str = "travelpayouts"
    travelpayouts_token: str = ""
    travelpayouts_marker: str = ""

    # Почта для ценовых подписок. Пока smtp_host пуст, письма не уходят наружу,
    # а печатаются в лог — так воркер можно гонять локально без почтового ящика.
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "Aviator <noreply@aviatour.travel>"
    smtp_use_tls: bool = True

    # Ценовой воркер
    price_watch_interval_seconds: int = 1800  # как часто просыпаться
    price_watch_batch: int = 50  # сколько подписок проверять за проход
    site_url: str = "http://localhost:3000"  # для ссылок в письмах

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
