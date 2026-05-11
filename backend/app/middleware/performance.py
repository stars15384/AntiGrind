"""
Performance Monitoring Middleware
记录API响应时间和慢查询警告
"""

import logging
import time

from fastapi import Request

logger = logging.getLogger(__name__)

# 性能阈值（毫秒）
SLOW_API_THRESHOLD_MS = 1000  # 1秒
VERY_SLOW_API_THRESHOLD_MS = 3000  # 3秒


async def add_performance_headers(request: Request, call_next):
    """
    中间件：为每个API请求添加性能相关header和日志

    功能：
    - 记录每个API的响应时间
    - 添加X-Process-Time header
    - 对慢请求发出警告日志
    - 统计QPS（可选）
    """
    start_time = time.time()

    # 调用下一个中间件/路由处理函数
    response = await call_next(request)

    # 计算处理时间
    process_time_ms = (time.time() - start_time) * 1000

    # 添加响应头
    response.headers["X-Process-Time"] = f"{process_time_ms:.2f}ms"
    request_id = getattr(request.state, "request_id", "N/A")
    response.headers["X-Request-ID"] = request_id

    # 日志记录
    method = request.method
    url = str(request.url.path)
    status_code = response.status_code

    log_message = f"API {method} {url} - Status: {status_code} - Time: {process_time_ms:.2f}ms"

    # 根据响应时间选择日志级别
    if process_time_ms > VERY_SLOW_API_THRESHOLD_MS:
        logger.warning(f"[VERY SLOW] {log_message}")
    elif process_time_ms > SLOW_API_THRESHOLD_MS:
        logger.warning(f"[SLOW] {log_message}")
    elif status_code >= 400:
        logger.error(f"[ERROR] {log_message}")
    else:
        logger.info(log_message)

    return response


class PerformanceTracker:
    """性能追踪器类（用于手动追踪代码块性能）"""

    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.end_time = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        elapsed_ms = (self.end_time - self.start_time) * 1000

        if exc_type is not None:
            logger.error(f"[Performance] {self.operation_name} FAILED after {elapsed_ms:.2f}ms")
        else:
            logger.debug(f"[Performance] {self.operation_name} completed in {elapsed_ms:.2f}ms")

        return False  # 不抑制异常

    @property
    def elapsed_ms(self) -> float:
        """获取已耗时间（毫秒）"""
        if self.start_time is None:
            return 0.0
        end = self.end_time or time.time()
        return (end - self.start_time) * 1000


def track_performance(operation_name: str):
    """
    装饰器版本的性能追踪器

    用法：
    @track_performance("generate_pdf_report")
    async def generate_pdf(...):
        ...
    """

    def decorator(func):
        async def async_wrapper(*args, **kwargs):
            with PerformanceTracker(operation_name):
                return await func(*args, **kwargs)

        def sync_wrapper(*args, **kwargs):
            with PerformanceTracker(operation_name):
                return func(*args, **kwargs)

        import asyncio

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper

    return decorator


# 使用示例：
"""
# 在main.py中添加中间件：
from app.middleware.performance import add_performance_headers

app.middleware("http")(add_performance_headers)

# 在需要追踪的函数上使用装饰器：
@track_performance("pdf_generation")
async def generate_certification_report(...):
    ...

# 或使用上下文管理器：
with PerformanceTracker("database_query") as tracker:
    result = await db.execute(query)
    print(f"Query took {tracker.elapsed_ms:.2f}ms")
"""
