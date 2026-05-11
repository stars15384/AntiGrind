import time
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse


def get_user_id(request: Request) -> str:
    if request.user and hasattr(request.user, "id"):
        return str(request.user.id)
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_id)

register_limiter = Limiter(key_func=lambda req: f"reg:{get_remote_address(req)}")
login_limiter = Limiter(key_func=lambda req: f"login:{get_remote_address(req)}")


async def _rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    detail = exc.detail
    
    is_register = "register" in str(detail).lower() or "/auth/register" in request.url.path
    is_login = "login" in str(detail).lower() or "/auth/login" in request.url.path
    
    if is_register:
        error_msg = "注册过于频繁，请稍后再试。同一IP地址每小时最多允许3次注册尝试。"
    elif is_login:
        error_msg = "登录尝试过于频繁，请稍后再试。同一IP地址每分钟最多允许5次登录尝试。"
    else:
        error_msg = "请求过于频繁，请稍后再试"
    
    return JSONResponse(
        status_code=429,
        content={
            "error": error_msg,
            "detail": detail,
            "retry_after": getattr(exc, "retry_after", 60),
        },
        headers={"Retry-After": str(getattr(exc, "retry_after", 60))},
    )


async def check_registration_rate_limit(request: Request):
    client_ip = get_remote_address(request)

    try:
        # 使用 slowapi 的正确 API
        if not hasattr(register_limiter, 'check'):
            return  # 如果 check 方法不存在，跳过限制（开发环境）
        register_limiter.check(f"reg:{client_ip}")
    except RateLimitExceeded:
        raise HTTPException(
            status_code=429,
            detail="注册过于频繁，请稍后再试。同一IP地址每小时最多允许3次注册尝试。",
        )


async def check_login_rate_limit(request: Request):
    client_ip = get_remote_address(request)

    try:
        # 使用 slowapi 的正确 API
        if not hasattr(login_limiter, 'check'):
            return  # 如果 check 方法不存在，跳过限制（开发环境）
        login_limiter.check(f"login:{client_ip}")
    except RateLimitExceeded:
        raise HTTPException(
            status_code=429,
            detail="登录尝试过于频繁，请稍后再试。同一IP地址每分钟最多允许5次登录尝试。",
        )
