# ===========================================
# AntiGrind Backend - 多阶段Docker构建
# 优化目标：镜像体积减少50%+，构建速度提升40%
# ===========================================

# ---- 阶段1: 构建依赖安装 ----
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --user --no-cache-dir -r requirements.txt

# ---- 阶段2: 生产运行时（最小化）----
FROM python:3.11-slim AS runtime

LABEL maintainer="AntiGrind Team"
LABEL description="AntiGrind API Server"
LABEL version="1.0.0"

WORKDIR /app

# 安装运行时依赖（最小化）
RUN apt-get update && apt-get install -y --no-install-recommends \
    # PostgreSQL客户端
    libpq5 \
    # 图像处理（用于考勤截图）
    libjpeg62-turbo \
    libtiff6 \
    # OCR引擎
    tesseract-ocr \
    tesseract-ocr-chi-sim \
    tesseract-ocr-eng \
    # 清理缓存
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# 从builder阶段复制Python包
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# 创建非root用户（安全最佳实践）
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

# 复制应用代码
COPY --chown=appuser:appuser . .

# 创建日志目录
RUN mkdir -p logs && chown appuser:appuser logs

# 环境变量配置
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# ---- 阶段3: 开发环境（可选）----
FROM runtime AS development

USER root

# 开发工具和调试依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    vim \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

USER appuser

ENV DEBUG=true
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
