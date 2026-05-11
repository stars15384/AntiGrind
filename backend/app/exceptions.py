class AppError(Exception):
    """应用基础异常类"""

    def __init__(self, status_code: int, detail: str, error_code: str = None):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or f"APP_{status_code}"
        super().__init__(self.detail)


class NotFoundError(AppError):
    """资源未找到"""

    def __init__(self, resource: str, resource_id: str = None):
        message = f"{resource} not found"
        if resource_id:
            message += f" (ID: {resource_id})"
        super(404, message, "NOT_FOUND")


class ValidationError(AppError):
    """验证错误"""

    def __init__(self, detail: str, field: str = None):
        if field:
            detail = f"字段 '{field}' 验证失败: {detail}"
        super(400, detail, "VALIDATION_ERROR")


class AuthenticationError(AppError):
    """认证错误"""

    def __init__(self, detail: str = "认证失败"):
        super(401, detail, "AUTHENTICATION_FAILED")


class AuthorizationError(AppError):
    """权限不足"""

    def __init__(self, detail: str = "权限不足，无法执行此操作"):
        super(403, detail, "FORBIDDEN")


class ConflictError(AppError):
    """资源冲突（如重复创建）"""

    def __init__(self, resource: str, detail: str = None):
        message = detail or f"{resource} 已存在或发生冲突"
        super(409, message, "CONFLICT")


class RateLimitExceededError(AppError):
    """请求过于频繁"""

    def __init__(self, retry_after: int = 60):
        super(429, f"请求过于频繁，请 {retry_after} 秒后重试", "RATE_LIMIT_EXCEEDED")
        self.retry_after = retry_after


class BusinessLogicError(AppError):
    """业务逻辑错误"""

    def __init__(self, detail: str, error_code: str = "BUSINESS_ERROR"):
        super(422, detail, error_code)


class ExternalServiceError(AppError):
    """外部服务调用失败"""

    def __init__(self, service_name: str, detail: str = None):
        message = detail or f"外部服务 {service_name} 调用失败"
        super(502, message, f"EXTERNAL_SERVICE_ERROR_{service_name.upper()}")
