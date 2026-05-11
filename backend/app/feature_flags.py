from typing import Any, Dict, Optional
import json
from pathlib import Path
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)


class FeatureFlags:
    """
    特性开关管理系统
    支持通过配置文件动态控制功能的开启/关闭
    """

    def __init__(self, config_path: Optional[str] = None):
        self._flags: Dict[str, Dict[str, Any]] = {}
        self._config_path = config_path or Path(__file__).parent.parent / "feature_flags.json"
        self._load_flags()

    def _load_flags(self) -> None:
        """加载特性开关配置"""
        config_file = Path(self._config_path)

        if not config_file.exists():
            logger.warning(f"Feature flags config not found at {self._config_path}, using defaults")
            self._load_default_flags()
            return

        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self._flags = data.get('features', {})
                logger.info(f"Loaded {len(self._flags)} feature flags from {config_file}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse feature flags config: {e}")
            self._load_default_flags()
        except Exception as e:
            logger.error(f"Error loading feature flags: {e}")
            self._load_default_flags()

    def _load_default_flags(self) -> None:
        """加载默认特性开关配置"""
        self._flags = {
            "authentication": {"enabled": True, "description": "用户认证系统"},
            "company_management": {"enabled": True, "description": "公司信息管理"},
            "work_hours_tracking": {"enabled": True, "description": "工时记录与追踪"},
            "certification_system": {"enabled": True, "description": "反内卷认证系统"},
            "ranking_system": {"enabled": True, "description": "公司排名系统"},
            "attendance_checkin": {"enabled": True, "description": "员工考勤打卡"},
            "evidence_upload": {"enabled": True, "description": "证据上传与管理"},
            "scan_verification": {"enabled": True, "description": "扫码验证功能"},
            "qa_system": {"enabled": True, "description": "问答系统"},
            "admin_dashboard": {"enabled": True, "description": "管理后台面板"},
            "analytics_dashboard": {"enabled": True, "description": "数据分析仪表盘"},
            "report_export": {"enabled": True, "description": "报告导出功能"},
            "captcha_verification": {"enabled": True, "description": "验证码验证"},
            "i18n_support": {"enabled": True, "description": "国际化支持"},
            "search_suggestions": {"enabled": True, "description": "搜索建议功能"},
            "performance_monitoring": {"enabled": False, "description": "性能监控"},
            "rate_limiting": {"enabled": True, "description": "API 限流"},
            "redis_cache": {"enabled": False, "description": "Redis 缓存"},
            "neo4j_graph": {"enabled": False, "description": "Neo4j 图数据库"},
            "meilisearch_search": {"enabled": False, "description": "Meilisearch 搜索"},
            "minio_storage": {"enabled": False, "description": "MinIO 存储"},
            "mobile_app_support": {"enabled": False, "description": "移动端支持"},
            "dark_mode": {"enabled": True, "description": "暗黑模式"},
            "virtual_scroll": {"enabled": True, "description": "虚拟滚动"},
        }

    def is_enabled(self, feature_name: str) -> bool:
        """检查特性是否启用"""
        flag = self._flags.get(feature_name)
        if flag is None:
            logger.warning(f"Unknown feature flag: {feature_name}, defaulting to False")
            return False
        return flag.get('enabled', False)

    def is_disabled(self, feature_name: str) -> bool:
        """检查特性是否禁用"""
        return not self.is_enabled(feature_name)

    def get_feature_info(self, feature_name: str) -> Optional[Dict[str, Any]]:
        """获取特性的完整信息"""
        return self._flags.get(feature_name)

    def list_all_features(self) -> Dict[str, Dict[str, Any]]:
        """列出所有特性及其状态"""
        return self._flags.copy()

    def list_enabled_features(self) -> Dict[str, Dict[str, Any]]:
        """列出所有启用的特性"""
        return {k: v for k, v in self._flags.items() if v.get('enabled', False)}

    def list_disabled_features(self) -> Dict[str, Dict[str, Any]]:
        """列出所有禁用的特性"""
        return {k: v for k, v in self._flags.items() if not v.get('enabled', False)}

    def list_features_by_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """按类别列出特性"""
        return {
            k: v for k, v in self._flags.items()
            if v.get('category') == category
        }


@lru_cache()
def get_feature_flags() -> FeatureFlags:
    """获取特性开关实例（单例模式）"""
    return FeatureFlags()


def require_feature(feature_name: str):
    """
    装饰器：要求特定特性必须启用才能访问
    用法：
        @require_feature('admin_dashboard')
        async def admin_endpoint():
            ...
    """
    from functools import wraps
    from fastapi import HTTPException

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            flags = get_feature_flags()
            if not flags.is_enabled(feature_name):
                raise HTTPException(
                    status_code=503,
                    detail={
                        "success": False,
                        "error": {
                            "code": "FEATURE_DISABLED",
                            "message": f"功能 '{feature_name}' 暂未开放",
                            "feature": feature_name,
                        },
                    },
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# 全局实例，便于导入使用
feature_flags = get_feature_flags()
