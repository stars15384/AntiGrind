from fastapi import APIRouter
from app.feature_flags import get_feature_flags

router = APIRouter(prefix="/api/features", tags=["feature-flags"])


@router.get("/")
async def list_all_features():
    """获取所有特性开关状态"""
    flags = get_feature_flags()
    return {
        "success": True,
        "data": {
            "features": flags.list_all_features(),
            "enabled_count": len(flags.list_enabled_features()),
            "disabled_count": len(flags.list_disabled_features()),
        },
    }


@router.get("/{feature_name}")
async def check_feature(feature_name: str):
    """检查特定特性的启用状态"""
    flags = get_feature_flags()
    info = flags.get_feature_info(feature_name)

    if not info:
        return {
            "success": False,
            "error": {
                "code": "FEATURE_NOT_FOUND",
                "message": f"特性 '{feature_name}' 不存在",
            },
        }

    return {
        "success": True,
        "data": {
            "name": feature_name,
            **info,
        },
    }


@router.get("/enabled/list")
async def list_enabled_features():
    """列出所有启用的特性"""
    flags = get_feature_flags()
    return {
        "success": True,
        "data": {
            "features": flags.list_enabled_features(),
            "count": len(flags.list_enabled_features()),
        },
    }


@router.get("/disabled/list")
async def list_disabled_features():
    """列出所有禁用的特性"""
    flags = get_feature_flags()
    return {
        "success": True,
        "data": {
            "features": flags.list_disabled_features(),
            "count": len(flags.list_disabled_features()),
        },
    }
