from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    APP_NAME: str = "sih-backend"
    API_PREFIX: str = "/api/v1"

    SECRET_KEY: str = "sih-super-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    DATABASE_URL: str = "postgresql+asyncpg://sih:sih@localhost:5432/sih"
    REDIS_URL: str = "redis://localhost:6379/0"

    MODEL_SERVICE_URL: str = "http://localhost:8100"
    WEATHER_API_BASE_URL: str = "https://api.open-meteo.com/v1"
    WEATHER_API_KEY: str = ""

    DEMO_MODE: bool = True
    DEMO_DATA_PATH: str = "app/utils/demo_fixtures"

    CACHE_TTL_WEATHER: int = 300
    CACHE_TTL_SATELLITE: int = 3600
    CACHE_TTL_PREDICTION: int = 600

    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
