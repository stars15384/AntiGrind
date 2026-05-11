from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel


class ProductBase(BaseModel):
    barcode: str
    name: str | None = None
    brand_owner_id: uuid.UUID | None = None
    manufacturer_id: uuid.UUID | None = None
    category: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: uuid.UUID
    image_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class CompanyBrief(BaseModel):
    id: uuid.UUID
    name: str
    agi_score: float | None
    verification_status: str


class ScanResult(BaseModel):
    product: ProductResponse | None
    brand_owner: CompanyBrief | None
    manufacturer: CompanyBrief | None
    is_oem: bool
    agi_score: float | None
    recommendation: str
