import uuid
from datetime import datetime

from pydantic import BaseModel


class EvidenceBase(BaseModel):
    company_id: uuid.UUID
    work_hour_record_id: uuid.UUID | None = None
    type: str
    file_type: str


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceResponse(EvidenceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    file_path: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
