import os
import secrets
import warnings
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Anti-Grind API"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"

    database_url: str = "sqlite+aiosqlite:///./antigrind.db"

    redis_url: str = "redis://localhost:6379/0"
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"

    meilisearch_url: str = "http://localhost:7700"
    meilisearch_api_key: str = ""

    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "evidences"
    minio_secure: bool = False

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    jwt_secret_key: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        description="JWT签名密钥，生产环境必须通过环境变量设置强密钥",
    )
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def is_debug(self) -> bool:
        return self.environment.lower() == "development" or self.debug

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    if settings.is_production:
        if settings.jwt_secret_key == "" or len(settings.jwt_secret_key) < 32:
            raise ValueError(
                "生产环境必须设置安全的JWT_SECRET_KEY（至少32字符），请通过环境变量配置"
            )
        if settings.cors_origins == "*":
            raise ValueError(
                "生产环境不允许CORS_ORIGINS设置为*，请明确指定允许的域名"
            )
    else:
        if os.environ.get("JWT_SECRET_KEY") is None:
            warnings.warn(
                f"\n⚠️  安全警告: 使用自动生成的JWT密钥（仅用于开发环境）\n"
                f"   当前密钥: {settings.jwt_secret_key[:8]}...\n"
                f"   生产环境请务必通过 JWT_SECRET_KEY 环境变量设置强密钥\n",
                UserWarning,
                stacklevel=2,
            )

    return settings
