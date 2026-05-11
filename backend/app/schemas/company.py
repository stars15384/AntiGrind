from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.work_hour import WorkHourRecordResponse


class CompanyBase(BaseModel):
    name: str
    name_en: str | None = None
    industry: str | None = None  # 行业分类 (GB/T 4754-2017)
    gs1_prefix: str | None = None
    parent_company_id: uuid.UUID | None = None
    description: str | None = None
    website: str | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    name_en: str | None = None
    industry: str | None = None  # 行业分类 (GB/T 4754-2017)
    gs1_prefix: str | None = None
    parent_company_id: uuid.UUID | None = None
    description: str | None = None
    website: str | None = None


class CompanyResponse(CompanyBase):
    id: uuid.UUID
    agi_score: float | None
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyDetail(CompanyResponse):
    subsidiaries: list[CompanyResponse] = []
    work_hour_records: list[WorkHourRecordResponse] = []


class CompanySearchResult(BaseModel):
    id: uuid.UUID
    name: str
    name_en: str | None = None
    industry: str | None = None  # 行业分类
    agi_score: float | None
    verification_status: str
