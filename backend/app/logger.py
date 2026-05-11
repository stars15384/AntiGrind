import logging
import sys

from loguru import logger

from app.config import get_settings


class InterceptHandler(logging.Handler):
    """
    标准logging到loguru的拦截器
    将第三方库（如SQLAlchemy、uvicorn）的日志转发给loguru
    """

    def emit(self, record: logging.LogRecord):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logging():
    """
    配置结构化日志系统

    特性：
    - 开发环境：彩色控制台输出 + 详细调试信息
    - 生产环境：JSON格式 + 文件轮转 + 错误级别以上告警
    - 自动捕获异常堆栈
    - 请求ID追踪支持
    """
    settings = get_settings()

    # 移除默认handler，避免重复日志
    logger.remove()

    # 开发环境配置
    if settings.is_debug:
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>",
            level="DEBUG",
            colorize=True,
            backtrace=True,
            diagnose=True,
        )

        # SQL查询日志（开发环境）
        logger.add(
            "logs/sql_{time:YYYY-MM-DD}.log",
            rotation="00:00",
            retention="3 days",
            level="DEBUG",
            filter=lambda record: "sqlalchemy" in record["name"].lower(),
            format="{time:HH:mm:ss} | {level:<8} | {message}",
        )

    # 生产环境配置
    else:
        # 控制台输出（仅错误及以上）
        logger.add(
            sys.stderr,
            format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{function}:{line} | {message}",
            level="ERROR",
            colorize=False,
        )

        # 主应用日志文件
        logger.add(
            "logs/app_{time:YYYY-MM-DD}.log",
            rotation="00:00",  # 每天午夜轮转
            retention="30 days",  # 保留30天
            compression="zip",  # 压缩旧日志
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | "
            "{level: <8} | "
            "{name}:{function}:{line} | "
            "{extra[request_id]} | "
            "{message}",
            enqueue=True,  # 异步写入，不阻塞主线程
        )

        # 错误日志单独文件（便于监控）
        logger.add(
            "logs/errors_{time:YYYY-MM-DD}.log",
            rotation="00:00",
            retention="90 days",
            level="ERROR",
            backtrace=True,
            diagnose=True,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | "
            "{level: <8} | "
            "{name}:{function}:{line} | "
            "{extra[user_id]} | "
            "{extra[ip]} | "
            "{message}",
        )

    # 拦截标准库日志
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # 设置第三方库日志级别
    for noisy_logger in ["uvicorn.access", "sqlalchemy.engine"]:
        logging.getLogger(noisy_logger).setLevel(logging.WARNING)

    return logger


def get_logger(name: str = None):
    """
    获取logger实例

    用法：
        from app.logger import get_logger

        log = get_logger(__name__)
        log.info("用户登录成功", extra={"user_id": user.id})

    Args:
        name: 模块名称（通常传__name__）

    Returns:
        loguru.Logger实例
    """
    if name:
        return logger.bind(name=name)
    return logger


# 常用日志辅助函数
def log_request(request_id: str, method: str, path: str, **kwargs):
    """记录API请求"""
    logger.bind(request_id=request_id).info(f"→ {method} {path}", **kwargs)


def log_response(request_id: str, status_code: int, duration_ms: float, **kwargs):
    """记录API响应"""
    level = "warning" if status_code >= 400 else "info"
    logger.bind(request_id=request_id).opt(colors=True).log(
        level, f"← {status_code} ({duration_ms:.0f}ms)", **kwargs
    )


def log_error(error: Exception, context: str = "", **kwargs):
    """记录错误（自动包含堆栈）"""
    logger.opt(exception=error).error(f"[{context}] {type(error).__name__}: {str(error)}", **kwargs)


def log_security_event(event_type: str, user_id: str = None, ip: str = None, details: str = ""):
    """记录安全相关事件（认证失败、权限错误等）"""
    logger.warning(
        f"🔒 Security Event: {event_type}",
        extra={
            "event_type": event_type,
            "user_id": user_id,
            "ip": ip,
            "details": details,
        },
    )
