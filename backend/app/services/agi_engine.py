import logging
from enum import Enum
from typing import Any, Optional

logger = logging.getLogger(__name__)


class WeekendPolicyScore(int, Enum):
    DOUBLE_REST = 0
    BIG_SMALL_WEEK = 10
    SINGLE_REST = 20
    NO_REST = 25


class OvertimeCompensationScore(int, Enum):
    LEGAL = 0
    FIXED_SUBSIDY = 5
    UNPAID = 15


class ShiftPolicyScore(int, Enum):
    NO_SHIFT = 0
    OCCASIONAL = 5
    FREQUENT = 10


class AGIEngine:
    WEIGHTS = {
        "hours": 0.40,
        "weekend": 0.25,
        "overtime": 0.15,
        "shift": 0.10,
        "vibe": 0.10,
    }

    CACHE_PREFIX = "agi:"
    CACHE_TTL_SECONDS = 3600

    def __init__(self, redis_client: Optional[Any] = None):
        self.redis = redis_client

    @staticmethod
    def calculate_hours_score(weekly_hours: int) -> int:
        if weekly_hours <= 40:
            return 0
        elif weekly_hours <= 48:
            return 10
        elif weekly_hours <= 60:
            return 30
        else:
            return 40

    @staticmethod
    def calculate_weekend_score(weekend_policy: str) -> int:
        scores = {
            "double_rest": WeekendPolicyScore.DOUBLE_REST,
            "big_small_week": WeekendPolicyScore.BIG_SMALL_WEEK,
            "single_rest": WeekendPolicyScore.SINGLE_REST,
            "no_rest": WeekendPolicyScore.NO_REST,
        }
        return scores.get(weekend_policy, 0)

    @staticmethod
    def calculate_overtime_score(overtime_compensation: str) -> int:
        scores = {
            "legal": OvertimeCompensationScore.LEGAL,
            "fixed_subsidy": OvertimeCompensationScore.FIXED_SUBSIDY,
            "unpaid": OvertimeCompensationScore.UNPAID,
        }
        return scores.get(overtime_compensation, 0)

    @staticmethod
    def calculate_shift_score(shift_policy: str) -> int:
        scores = {
            "no_shift": ShiftPolicyScore.NO_SHIFT,
            "occasional": ShiftPolicyScore.OCCASIONAL,
            "frequent": ShiftPolicyScore.FREQUENT,
        }
        return scores.get(shift_policy, 0)

    def calculate_agi(
        self,
        weekly_hours: int,
        weekend_policy: str,
        overtime_compensation: str,
        shift_policy: str,
        vibe_score: int = 0,
    ) -> float:
        hours_score = self.calculate_hours_score(weekly_hours)
        weekend_score = self.calculate_weekend_score(weekend_policy)
        overtime_score = self.calculate_overtime_score(overtime_compensation)
        shift_score = self.calculate_shift_score(shift_policy)

        agi = (
            hours_score * self.WEIGHTS["hours"]
            + weekend_score * self.WEIGHTS["weekend"]
            + overtime_score * self.WEIGHTS["overtime"]
            + shift_score * self.WEIGHTS["shift"]
            + vibe_score * self.WEIGHTS["vibe"]
        )

        return round(agi, 2)

    async def get_cached_agi(self, company_id: str) -> Optional[float]:
        """从Redis缓存获取AGI评分"""
        if not self.redis:
            return None

        try:
            cache_key = f"{self.CACHE_PREFIX}{company_id}"
            cached_value = await self.redis.get(cache_key)

            if cached_value:
                logger.debug(f"Cache hit for AGI of company {company_id}")
                return float(cached_value)

            return None
        except Exception as e:
            logger.warning(f"Failed to get AGI from Redis cache: {e}")
            return None

    async def set_cached_agi(self, company_id: str, agi_score: float) -> None:
        """将AGI评分写入Redis缓存"""
        if not self.redis:
            return

        try:
            cache_key = f"{self.CACHE_PREFIX}{company_id}"
            await self.redis.setex(cache_key, self.CACHE_TTL_SECONDS, str(agi_score))
            logger.debug(f"Cached AGI for company {company_id}: {agi_score}")
        except Exception as e:
            logger.warning(f"Failed to cache AGI in Redis: {e}")

    async def invalidate_company_cache(self, company_id: str) -> None:
        """使指定企业的AGI缓存失效（新数据提交时调用）"""
        if not self.redis:
            return

        try:
            cache_key = f"{self.CACHE_PREFIX}{company_id}"
            await self.redis.delete(cache_key)
            logger.info(f"Invalidated AGI cache for company {company_id}")
        except Exception as e:
            logger.warning(f"Failed to invalidate AGI cache: {e}")

    async def calculate_company_agi(self, company_id: Any, db: Any) -> float:
        from sqlalchemy import select

        from app.models import WorkHourRecord

        cached_agi = await self.get_cached_agi(str(company_id))
        if cached_agi is not None:
            return cached_agi

        result = await db.execute(
            select(WorkHourRecord).where(
                WorkHourRecord.company_id == company_id,
                WorkHourRecord.status == "verified",
            )
        )
        records = result.scalars().all()

        if not records:
            agi = 0.0
        else:
            total_agi = 0.0
            for record in records:
                agi = self.calculate_agi(
                    weekly_hours=record.weekly_hours,
                    weekend_policy=record.weekend_policy,
                    overtime_compensation=record.overtime_compensation,
                    shift_policy=record.shift_policy,
                    vibe_score=record.vibe_score,
                )
                total_agi += agi

            agi = round(total_agi / len(records), 2)

        await self.set_cached_agi(str(company_id), agi)
        return agi
