import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class WeekendPolicy(str, Enum):
    DOUBLE_REST = "double_rest"
    BIG_SMALL_WEEK = "big_small_week"
    SINGLE_REST = "single_rest"
    NO_REST = "no_rest"


class OvertimeCompensation(str, Enum):
    LEGAL = "legal"
    FIXED_SUBSIDY = "fixed_subsidy"
    UNPAID = "unpaid"


class ShiftPolicy(str, Enum):
    NO_SHIFT = "no_shift"
    OCCASIONAL = "occasional"
    FREQUENT = "frequent"


class WorkHourRecordBase(BaseModel):
    company_id: uuid.UUID
    weekly_hours: int
    weekend_policy: WeekendPolicy
    overtime_compensation: OvertimeCompensation
    shift_policy: ShiftPolicy
    vibe_score: int = 0
    notes: str | None = None


class WorkHourRecordCreate(WorkHourRecordBase):
    pass


class WorkHourRecordResponse(WorkHourRecordBase):
    id: uuid.UUID
    user_id: uuid.UUID
    source: str
    verification_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class WorkHourRecordVerify(BaseModel):
    verified: bool
