import uuid
from datetime import datetime

from pydantic import BaseModel


class CertificationBase(BaseModel):
    company_id: uuid.UUID
    policy_document_url: str | None = None
    evidence_urls: list[str] | None = None


class CertificationCreate(CertificationBase):
    pass


class CertificationReview(BaseModel):
    approved: bool
    review_notes: str | None = None
    certification_level: str | None = None


class CertificationResponse(CertificationBase):
    id: uuid.UUID
    status: str
    submitted_by: uuid.UUID
    reviewed_by: uuid.UUID | None
    review_notes: str | None
    approved_at: datetime | None
    expires_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class CertificationBadgeResponse(BaseModel):
    id: uuid.UUID
    badge_code: str
    badge_url: str | None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
