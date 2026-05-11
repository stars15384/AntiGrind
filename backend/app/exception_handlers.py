import traceback

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.exceptions import AppError


async def app_exception_handler(request: Request, exc: AppError):
    """处理应用自定义异常"""
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


async def generic_exception_handler(request: Request, exc: Exception):
    """处理未预期的通用异常"""
    from app.config import get_settings

    settings = get_settings()

    error_detail = str(exc)

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


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """处理数据库完整性错误（如唯一约束冲突）"""
    from app.config import get_settings

    settings = get_settings()
    error_msg = str(exc.orig) if hasattr(exc, "orig") else str(exc)

    if "UNIQUE constraint" in error_msg or "duplicate" in error_msg.lower():
        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "error": {
                    "code": "DUPLICATE_ENTRY",
                    "message": "数据已存在，无法重复创建",
                    "detail": error_msg if settings.is_debug else None,
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
                "detail": error_msg if settings.is_debug else None,
            },
        },
    )


async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    """处理数据库错误"""
    from app.config import get_settings

    settings = get_settings()
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "DATABASE_ERROR",
                "message": "数据库操作失败，请稍后重试",
                "detail": str(exc) if settings.is_debug else None,
            },
        },
    )
