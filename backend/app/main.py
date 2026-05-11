import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.api import (
    auth_router,
    companies_router,
    evidences_router,
    scan_router,
    work_hours_router,
    certifications_router,
    attendance_router,
    qa_router,
    rankings_router,
    admin_router,
    features_router,
)
from app.config import get_settings
from app.exceptions import AppException
from app.middleware.performance import add_performance_headers

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "请求过于频繁，请稍后再试",
                    "detail": exc.detail,
                    "retry_after": 60,
                },
            },
            headers={"Retry-After": "60"},
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.error_code,
                    "message": exc.detail,
                },
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        error_msg = str(exc.orig) if hasattr(exc, 'orig') else str(exc)

        if "UNIQUE constraint" in error_msg or "duplicate" in error_msg.lower():
            return JSONResponse(
                status_code=409,
                content={
                    "success": False,
                    "error": {
                        "code": "DUPLICATE_ENTRY",
                        "message": "数据已存在，无法重复创建",
                    },
                },
            )

        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": "数据操作失败",
                },
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": "数据库操作失败，请稍后重试",
                },
            },
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        if settings.is_debug:
            error_detail = {
                "message": str(exc),
                "type": type(exc).__name__,
                "traceback": traceback.format_exc(),
            }
        else:
            error_detail = "服务器内部错误，请稍后重试"

        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": error_detail,
                },
            },
        )

    cors_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
        max_age=600,
    )

    # 添加性能监控中间件（必须在CORS之后）
    app.middleware("http")(add_performance_headers)

    app.include_router(auth_router, prefix="/api")
    app.include_router(companies_router, prefix="/api")
    app.include_router(scan_router, prefix="/api")
    app.include_router(work_hours_router, prefix="/api")
    app.include_router(evidences_router, prefix="/api")
    app.include_router(certifications_router, prefix="/api")
    app.include_router(attendance_router, prefix="/api")
    app.include_router(qa_router, prefix="/api")
    app.include_router(rankings_router, prefix="/api")
    app.include_router(admin_router, prefix="/api")
    app.include_router(features_router)

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": settings.app_version}

    return app


app = create_app()
