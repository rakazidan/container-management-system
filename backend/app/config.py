from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Server
    port: int = 8001
    node_env: str = "development"

    # Database
    database_url: str = "postgresql://admin:secret@localhost:5432/container_mgmt"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:4173"

    # OCR Service
    ocr_service_url: str = "http://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
